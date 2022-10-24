export interface TaskTodo {
  title: String
  description: String
}
export interface TaskModel {
  id?: String
  title?: String
  description?: String
  dateCreated?: Number
  dateAssigned?: Number
  dateCompleted?: Number
  dateClosed?: Number
  taskStatus?: String
  createdBy?: String
  assignedTo?: String
}
