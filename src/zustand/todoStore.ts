import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Todo = {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "In Progress" | "Done" | "Kill";
  dueDate: Date | null;
};

type TodoStore = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updated: Todo) => void;
  deleteTodo: (id: string) => void;
  clearTodos: () => void;
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],

      addTodo: (todo) =>
        set((state) => ({
          todos: [...state.todos, todo],
        })),

      updateTodo: (id, updated) =>
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? updated : todo)),
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      clearTodos: () => set({ todos: [] }),
    }),
    {
      name: "todo-storage",
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            state: {
              ...parsed,
              todos: parsed.todos.map(
                (todo: Todo & { dueDate: string | null }) => ({
                  ...todo,
                  dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
                }),
              ),
            },
          };
        },
        setItem: (name: string, value: { state: TodoStore }) => {
          const serialized = {
            ...value.state,
            todos: value.state.todos.map((todo) => ({
              ...todo,
              dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
            })),
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name: string) => localStorage.removeItem(name),
      },
    },
  ),
);
