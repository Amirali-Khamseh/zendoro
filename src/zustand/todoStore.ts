import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";

export type Todo = {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "In Progress" | "Done" | "Kill";
  dueDate: Date | null;
  userId?: number;
};

type TodoStore = {
  todos: Todo[];
  fetchTodos: () => Promise<void>;
  addTodo: (todo: Omit<Todo, "id" | "userId">) => Promise<void>;
  updateTodo: (
    id: number,
    updates: Partial<Omit<Todo, "id" | "userId">>,
  ) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  clearTodos: () => void;
};
const getTodos = async () => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
    const result = await fetch(`${API_BASE_URL}/todo`, {
      method: "GET",
      headers,
    });
    if (!result.ok) {
      throw new Error("Failed to fetch todos");
    }
    const data = await result.json();
    return data.map((todo: Todo) => ({
      ...todo,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
    }));
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
};

const createTodo = async (todo: Omit<Todo, "id" | "userId">) => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
    const result = await fetch(`${API_BASE_URL}/todo`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...todo,
        dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
      }),
    });
    if (!result.ok) {
      throw new Error("Failed to create todo");
    }
    const data = await result.json();
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    };
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
};

const updateTodo = async (
  id: number,
  updates: Partial<Omit<Todo, "id" | "userId">>,
) => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
    const result = await fetch(`${API_BASE_URL}/todo/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        ...updates,
        dueDate: updates.dueDate ? updates.dueDate.toISOString() : null,
      }),
    });
    if (!result.ok) {
      throw new Error("Failed to update todo");
    }
    const data = await result.json();
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    };
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
};

const deleteTodo = async (id: number) => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
    const result = await fetch(`${API_BASE_URL}/todo/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!result.ok) {
      throw new Error("Failed to delete todo");
    }
    return true;
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
};
export const useTodoStore = create<TodoStore>()((set) => ({
  todos: [],
  fetchTodos: async () => {
    const todos = await getTodos();
    set({ todos });
  },
  addTodo: async (todo) => {
    try {
      const newTodo = await createTodo(todo);
      set((state) => ({
        todos: [...state.todos, newTodo],
      }));
    } catch (error) {
      console.error("Failed to add todo:", error);
      throw error;
    }
  },

  updateTodo: async (id, updates) => {
    try {
      const updatedTodo = await updateTodo(id, updates);
      set((state) => ({
        todos: state.todos.map((todo) => (todo.id === id ? updatedTodo : todo)),
      }));
    } catch (error) {
      console.error("Failed to update todo:", error);
      throw error;
    }
  },

  deleteTodo: async (id) => {
    try {
      await deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete todo:", error);
      throw error;
    }
  },

  clearTodos: () => set({ todos: [] }),
}));
