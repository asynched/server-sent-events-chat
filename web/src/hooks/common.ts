import { useState, useEffect, useMemo, useCallback } from 'react'

/**
 * # useReference
 *
 * A helper hook to create a referenced value.
 *
 * This can be used instead of the `useState`, allowing for listenable and
 * mutable values without a setter.
 *
 * @example
 * // This
 * const [counter, setCounter] = useState(0)
 *
 * // Is equivalent to this
 * const counter = useReference(0)
 * console.log(counter.value) // 0
 *
 * // You can mutate it as well
 * counter.value++
 * console.log(counter.value) // 1
 *
 * @param value Initial value for the ref.
 * @returns An object containing the value itself.
 */
export function useReference<Type>(value: Type) {
  const [state, setState] = useState({
    value,
  })

  const proxy = useMemo(
    () =>
      new Proxy(state, {
        get(_target, _key) {
          return state.value
        },
        set(_target, _key, value) {
          setState(() => ({
            value,
          }))
          return true
        },
      }),
    [state, setState]
  )

  return proxy
}

/**
 * # useRecord
 *
 * Just like the `useReference` hook, this allows you to create a mutable
 * object that can be listened to by React. However, this hook allows you to
 * create a listenable object with multiple properties.
 *
 * @example
 * // This
 * const [user, setUser] = useState({
 *  name: 'John Doe',
 *  age: 30,
 * })
 *
 * // Is equivalent to this
 * const user = useRecord({
 *   name: 'John Doe',
 *   age: 30,
 * })
 *
 * // Where you can mutate the property itself
 * // and it will still be reactive.
 * user.name = 'Jane Doe'
 *
 * @param value Initial value for the record.
 * @returns An object containing the value itself.
 */
export function useRecord<RecordType extends Record<string, unknown>>(
  value: RecordType
) {
  const [state, setState] = useState(value)

  const proxy = useMemo(
    () =>
      new Proxy(state, {
        get(_target, key) {
          return state[key as keyof RecordType]
        },
        set(_target, key, value) {
          setState((state) => ({
            ...state,
            [key]: value,
          }))
          return true
        },
      }),
    [state, setState]
  )

  return proxy
}

/**
 * # useToggle
 *
 * A helper hook to create a value that can be toggled.
 *
 * @example
 * // This
 * const [value, setToggle] = useState(false)
 *
 * const toggle = () => setToggle(p => !p)
 *
 * // Is equivalent to this
 * const [value, toggle, setValue] = useToggle(false)
 *
 * // Where you can use the `toggle` function to toggle the inner
 * // boolean value of the state.
 * toggle()
 *
 * @param initial Initial value for the toggle.
 * @returns A tuple containing the value, the toggle function, and the setter.
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)

  const toggle = () => setValue(!value)

  return [value, toggle, setValue] as const
}

type GenericObservable = Record<string, unknown>

type Observable<State extends GenericObservable> = {
  get: () => State
  set: (value: State) => void
  subscribe: (callback: (value: State) => void) => () => void
  update: (state: Partial<State>) => void
}

/**
 * # createObservable
 *
 * This is a helper function to create an observable object.
 *
 * The observable acts like a React `Context` but without the need for a
 * provider. With this you can share state between components and update it
 * from anywhere.
 *
 * @example
 * // Create the observable
 * const user$ = createObservable({
 *   name: 'John Doe',
 *   age: 30,
 * })
 *
 * // You can use a regular function like an action
 * const setName = (name: string) => user$.update({ name })
 *
 * // And inside your component you can use the `useObservable` hook.
 * const User = () => {
 *   const user = useObservable(user$)
 *
 *   return (
 *     <div>
 *       Hello, {user.name}
 *     </div>
 *   )
 * }
 *
 * @param state Initial state for the observable.
 * @returns An observable object.
 */
export function createObservable<State extends GenericObservable>(
  state: State
): Observable<State> {
  const listeners = new Set<(state: State) => void>()

  return {
    get() {
      return state as State
    },
    set(newState: State) {
      state = newState
      listeners.forEach((listener) => listener(newState))
    },
    update(newState: Partial<State>) {
      this.set({ ...state, ...newState })
    },
    subscribe(listener: (state: State) => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/**
 * # useObservable
 *
 * Helper hook to be used in conjunction with an observable.
 *
 * @example
 * // Create the observable
 * const user$ = createObservable({
 *   name: 'John Doe',
 *   age: 30,
 * })
 *
 * // And then inside your component you can use the `useObservable` hook
 * // to flatten the observable into it's current state.
 * const User = () => {
 *   const user = useObservable(user$)
 *   console.log(user) // { name: 'John Doe', age: 30 }
 * }
 *
 * @param observable Observable to be used in the hook.
 * @returns The current state of the observable.
 */
export function useObservable<State extends GenericObservable>(
  observable: Observable<State>
) {
  const [state, setState] = useState(observable.get())

  useEffect(() => observable.subscribe(setState), [observable])

  return state
}

/**
 * # useDerivedObservable
 *
 * Helper hook to be used in conjunction with an observable. With this, you can
 * use a selector function to get a derived value from the observable.
 *
 * @example
 * // Create the observable
 * const user$ = createObservable({
 *   name: 'John Doe',
 *   age: 30,
 * })
 *
 * // And with the `useDerivedObservable` we'll create a value that's derived
 * // from the observable state with the age multiplied by 2.
 * const User = () => {
 *   const doubleAge = useDerivedObservable(user$, (user) => user.age * 2)
 *
 *   return <p>The age multiplied by two is: {doubleAge}</p>
 * }
 *
 * @param observable Observable to be used in the hook.
 * @param selector Selector function to get the derived value.
 * @returns The derived value.
 */
export function useDerivedObservable<State extends GenericObservable, Selected>(
  observable: Observable<State>,
  selector: (state: State) => Selected
) {
  const [state, setState] = useState(selector(observable.get()))

  useEffect(
    () => observable.subscribe((state) => setState(selector(state))),
    [observable]
  )

  return state
}

type HTMLChangeableElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

type TransformValueFunction<Form, Entry extends keyof Form> = (
  value: Form[Entry]
) => Form[Entry]

/**
 * # useForm
 *
 * A helper hook to create and manage a form and it's state.
 * This will create a reactive object with the form state and a callback to
 * register the form elements.
 *
 * @example
 *
 * const Form = () => {
 *   const [form, register] = useForm({ name: 'Foo' })
 *
 *   return (
 *     <form>
 *       <input name="name" {...register('name')} />
 *     </form>
 *   )
 * }
 *
 * @param state Initial state for the form.
 * @returns A tuple containing the form state and the register function.
 */
export function useForm<Form extends Record<string, string | number | boolean>>(
  state: Form
) {
  const [form, setForm] = useState(state)

  const register = useCallback(
    <Entry extends keyof Form>(
      entry: Entry,
      transform?: TransformValueFunction<Form, Entry>
    ) => ({
      value: form[entry],
      onChange: (event: React.ChangeEvent<HTMLChangeableElement>) => {
        const toPrimitiveValue =
          typeof form[entry] === 'number'
            ? Number
            : typeof form[entry] === 'boolean'
            ? Boolean
            : String

        if (transform) {
          setForm({
            ...form,
            [entry]: transform(
              toPrimitiveValue(event.target.value) as Form[Entry]
            ),
          })

          return
        }

        setForm((form) => ({
          ...form,
          [entry]: toPrimitiveValue(event.target.value),
        }))
      },
    }),
    [form, setForm]
  )

  return [form, register] as const
}
