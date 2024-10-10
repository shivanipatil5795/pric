import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../user.model';  // Assuming you have a user model for type safety

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: User[] = [];   // Array to store user data
  newUser: User = { id: '', name: '', email: '' };  // Model for the new user form
  isEditMode: boolean = false;  // Check if we are editing a user
  selectedUserId: string = '';  // ID of the user being edited

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  // Fetch all users from the backend (Google Cloud Functions or json-server)
  fetchUsers() {
    this.http.get<User[]>('http://localhost:3000/users')
      .subscribe((data: User[]) => {
        this.users = data;
      });
  }

  // Create a new user
  createUser() {
    // Fetch the users to find the highest id
    this.http.get<User[]>('http://localhost:3000/users')
      .subscribe((users: User[]) => {
        // Filter out any non-number ids before finding the max
        const numericIds = users.map(user => parseInt(user.id)).filter(id => !isNaN(id));
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const newId = (maxId + 1).toString();  // Increment the id and convert to string
        
        // Assign the new id to the user
        const newUser = { ...this.newUser, id: newId };
  
        // Now send a POST request to create the new user
        this.http.post<User>('http://localhost:3000/users', newUser)
          .subscribe((user: User) => {
            this.users.push(user);  // Add the new user to the local array
            this.resetForm();       // Reset the form after user creation
          });
      });
  }
  
  

  // Select a user to edit
  editUser(user: User) {
    this.isEditMode = true;
    this.newUser = { ...user };  // Populate form with selected user data
    this.selectedUserId = user.id;
  }

  // Update an existing user
  updateUser() {
    this.http.put(`http://localhost:3000/users/${this.selectedUserId}`, this.newUser)
      .subscribe(() => {
        this.fetchUsers();  // Refresh the user list
        this.resetForm();
      });
  }

  // Delete a user
  deleteUser(id: string) {
    this.http.delete(`http://localhost:3000/users/${id}`)
      .subscribe(() => {
        this.users = this.users.filter(user => user.id !== id);  // Remove deleted user from the array
      });
  }

  // Reset the form and mode after submission
  resetForm() {
    this.isEditMode = false;
    this.newUser = { id: '', name: '', email: '' };
  }
}
