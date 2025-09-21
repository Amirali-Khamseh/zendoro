import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { useReminderStore } from "@/zustand/reminderStore";
import { DeleteConfirmationDialog } from "@/componenets/Reminder/DeleteConfirmation";
import { QuickAddForm } from "@/componenets/Reminder/QuickAddForm";
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
        <h1 className="text-4xl font-bold text-white mb-2">Reminder App</h1>
        <p className="text-white/70 mb-4">
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
          <div className="relative overflow-hidden rounded-lg p-6">
            {/* Background Glow Effects */}
            <div
              className="absolute bottom-0 left-[-20%] right-0 top-[-10%] 
                        h-[500px] w-[500px] rounded-full 
                        bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"
            ></div>
            <div
              className="absolute bottom-0 right-[-20%] top-[-10%] 
                        h-[500px] w-[500px] rounded-full 
                        bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"
            ></div>

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-white">Calendar</h2>
                <GradientButton
                  onClick={() => setShowForm(true)}
                  className="h-9"
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
          <div className="relative overflow-hidden rounded-lg p-6">
            {/* Background Glow Effects */}
            <div
              className="absolute bottom-0 left-[-20%] right-0 top-[-10%] 
                        h-[500px] w-[500px] rounded-full 
                        bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"
            ></div>
            <div
              className="absolute bottom-0 right-[-20%] top-[-10%] 
                        h-[500px] w-[500px] rounded-full 
                        bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"
            ></div>

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white mb-4">
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
