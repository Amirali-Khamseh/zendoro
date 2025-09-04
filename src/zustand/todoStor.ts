import { create } from "zustand";

export type Todo = {
  title: string;
  description: string;
  status: "TODO" | "In Progress" | "Done" | "Kill";
  dueDate: Date | null;
};

type TodoStore = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  updateTodo: (index: number, updated: Todo) => void;
  deleteTodo: (index: number) => void;
  clearTodos: () => void;
};
export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],

  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),

  updateTodo: (index, updated) =>
    set((state) => ({
      todos: state.todos.map((t, i) => (i === index ? updated : t)),
    })),

  deleteTodo: (index) =>
    set((state) => ({
      todos: state.todos.filter((_, i) => i !== index),
    })),

  clearTodos: () => set({ todos: [] }),
}));
