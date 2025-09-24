import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { useReminderStore, type Reminder } from "@/zustand/reminderStore";
import { DeleteConfirmationDialog } from "@/componenets/Reminder/DeleteConfirmation";
import { ReminderForm } from "@/componenets/Reminder/ReminderForm";
import { Calendar } from "@/componenets/Reminder/Calender";
import { ReminderList } from "@/componenets/Reminder/ReminderList";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/reminder")({
  component: RouteComponent,
});

function RouteComponent() {
  useDocumentTitle("Reminders");

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

  const handleAddReminder = (reminder: Omit<Reminder, "id">) => {
    addReminder(reminder);
  };

  const handleUpdateReminder = (id: string, updates: Partial<Reminder>) => {
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

  const handleEditReminder = (reminder: Reminder) => {
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
    <div className="p-2 md:p-4 overflow-x-hidden">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
          Reminder App
        </h1>
        <p className="text-white/70 mb-3 md:mb-4 text-sm md:text-base">
          Stay organized and never miss important tasks
        </p>

        <div className="flex flex-wrap gap-2 md:gap-4 overflow-x-hidden">
          <Badge
            variant="default"
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-xs md:text-sm"
          >
            <CalendarIcon className="w-3 h-3 md:w-4 md:h-4" />
            <span>{totalReminders} Total</span>
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-xs md:text-sm"
          >
            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span>{completedReminders} Completed</span>
          </Badge>
          <Badge
            variant="default"
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-xs md:text-sm"
          >
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-accent" />
            <span>{todayReminders} Today</span>
          </Badge>
          {overdueReminders > 0 && (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-xs md:text-sm"
            >
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span>{overdueReminders} Overdue</span>
            </Badge>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-hidden">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-lg p-3 md:p-6">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                  Calendar
                </h2>
                <GradientButton
                  onClick={() => setShowForm(true)}
                  className="h-9 text-xs md:text-sm w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </GradientButton>
              </div>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                reminders={reminders}
              />
            </div>
          </div>
        </div>

        {/* Reminders Section */}
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden rounded-lg p-3 md:p-6">
            <div className="relative z-10">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">
                Reminders for {selectedDate.toLocaleDateString()}
              </h2>

              <ReminderList
                reminders={getRemindersByDate(selectedDate)}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditReminder}
                onDelete={handleDeleteReminder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Form Modal */}
      {showForm && (
        <ReminderForm
          reminder={editingReminder}
          selectedDate={selectedDate}
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
