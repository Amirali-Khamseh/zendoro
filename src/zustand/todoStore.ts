import { create } from "zustand";

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

export const useTodoStore = create<TodoStore>((set) => ({
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
}));
