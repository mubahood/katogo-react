// src/app/models/UserModel.ts

/**
 * UserModel for basic user information
 * Following the system rules: id is integer, rest are strings with empty defaults
 */
export class UserModel {
  id: number = 0;
  username: string = "";
  email: string = "";
  first_name: string = "";
  last_name: string = "";
  avatar: string = "";
  phone_number: string = "";
  status: string = "";
  user_type: string = "";
  remember_token: string = "";
  created_at: string = "";
  updated_at: string = "";

  /**
   * Updates the user fields with provided data.
   * @param data Partial data to update the user.
   */
  updateUser(data: Partial<UserModel>): void {
    Object.assign(this, data);
  }

  /**
   * Returns the full name by concatenating first and last names.
   */
  get fullName(): string {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  /**
   * Converts the UserModel instance to a plain object.
   * Useful for sending data to APIs.
   */
  toJSON(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        result[key] = (this as any)[key];
      }
    }
    return result;
  }

  /**
   * Creates a UserModel instance from a plain object.
   * Useful for initializing from API responses.
   * @param data The plain object containing user data.
   */
  static fromJson(data: any): UserModel {
    const model = new UserModel();

    if (!data) {
      return model;
    }

    try {
      // Parse JSON if it's a string
      const obj = typeof data === 'string' ? JSON.parse(data) : data;

      // Get all keys from the UserModel instance
      const modelKeys = Object.keys(model);

      // Iterate through each key in the object
      for (const key of Object.keys(obj)) {
        if (modelKeys.includes(key)) {
          if (key === 'id') {
            // Ensure id is integer
            (model as any)[key] = parseInt(obj[key]) || 0;
          } else {
            // All other fields are strings
            (model as any)[key] = String(obj[key] || '');
          }
        }
      }
    } catch (error) {
      console.error('Error parsing UserModel data:', error);
      return new UserModel();
    }
    return model;
  }
}
