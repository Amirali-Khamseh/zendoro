import { useTodoStore, type Todo } from "@/zustand/todoStore";
import { Pencil, Trash } from "lucide-react";
import { useStore } from "zustand";

export default function Todo({
  id,
  description,
  dueDate,
  status,
  title,
}: Todo) {
  const { updateTodo, deleteTodo } = useTodoStore();
  return (
    <div>
      <div>{id}</div>
      <div>{title}</div>
      <div>{description}</div>
      <div>{dueDate?.toDateString()}</div>
      <div>{status}</div>
      <button
        onClick={() =>
          updateTodo(id, { id, title, description, status, dueDate })
        }
      >
        <Pencil />
      </button>
      <button onClick={() => deleteTodo(id)}>
        <Trash />
      </button>
    </div>
  );
}
