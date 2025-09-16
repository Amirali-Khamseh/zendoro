import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { useReminderStore } from "@/zustand/reminderStore";
import { DeleteConfirmationDialog } from "@/componenets/Reminder/DeleteConfirmation";
import { QuickAddForm } from "@/componenets/Reminder/QuickAddForm";
import { ReminderForm } from "@/componenets/Reminder/ReminderForm";
import { Calendar } from "@/componenets/Reminder/Calender";
import { ReminderList } from "@/componenets/Reminder/ReminderList";

export const Route = createFileRoute("/reminder")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    reminders,
    selectedDate,
    showForm,
    editingReminder,
    deletingReminder,
    addReminder,
    updateReminder,
    deleteReminder,
    confirmDelete,
    toggleComplete,
    setSelectedDate,
    setShowForm,
    setEditingReminder,
    setDeletingReminder,
    getTotalReminders,
    getCompletedReminders,
    getTodayReminders,
    getOverdueReminders,
    getRemindersByDate,
  } = useReminderStore();

  const handleAddReminder = (reminder: Omit<any, "id">) => {
    addReminder(reminder);
  };

  const handleUpdateReminder = (id: string, updates: Partial<any>) => {
    updateReminder(id, updates);
  };

  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
  };

  const handleConfirmDelete = () => {
    if (deletingReminder) {
      confirmDelete();
    }
  };

  const handleToggleComplete = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      toggleComplete(id);
    }
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReminder(null);
  };

  const totalReminders = getTotalReminders();
  const completedReminders = getCompletedReminders();
  const todayReminders = getTodayReminders();
  const overdueReminders = getOverdueReminders();

  return (
    <div className="p-4 overflow-x-hidden">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Reminder App
        </h1>
        <p className="text-muted-foreground mb-4">
          Stay organized and never miss important tasks
        </p>

        <div className="flex flex-wrap gap-4 overflow-x-hidden">
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1  text-white"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{totalReminders} Total</span>
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1  text-white"
          >
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{completedReminders} Completed</span>
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1  text-white"
          >
            <Clock className="w-4 h-4 text-accent" />
            <span>{todayReminders} Today</span>
          </Badge>
          {overdueReminders > 0 && (
            <Badge
              variant="destructive"
              className="flex items-center gap-2 px-3 py-1  text-white"
            >
              <Clock className="w-4 h-4" />
              <span>{overdueReminders} Overdue</span>
            </Badge>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-x-hidden">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-card-foreground">
                Calendar
              </h2>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              reminders={reminders}
            />
          </div>
        </div>

        {/* Reminders Section */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4">
              Reminders for {selectedDate.toLocaleDateString()}
            </h2>

            <div className="mb-4">
              <QuickAddForm
                selectedDate={selectedDate}
                onAdd={handleAddReminder}
              />
            </div>

            <ReminderList
              reminders={getRemindersByDate(selectedDate)}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditReminder}
              onDelete={handleDeleteReminder}
            />
          </div>
        </div>
      </div>

      {/* Reminder Form Modal */}
      {showForm && (
        <ReminderForm
          reminder={editingReminder}
          onSave={
            editingReminder
              ? (updates) => handleUpdateReminder(editingReminder.id, updates)
              : handleAddReminder
          }
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        reminder={deletingReminder}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingReminder(null)}
      />
    </div>
  );
}
