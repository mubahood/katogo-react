export class User {
  id!: number;
  username!: string;
  password!: string;
  name!: string;
  avatar!: string;
  remember_token!: string;
  created_at!: Date;
  updated_at!: Date;
  enterprise_id!: number;
  first_name!: string;
  last_name!: string;
  date_of_birth!: Date;
  place_of_birth!: string;
  sex!: string;
  home_address!: string;
  current_address!: string;
  phone_number_1!: string;
  phone_number_2!: string;
  email!: string;
  nationality!: string;
  religion!: string;
  spouse_name!: string;
  spouse_phone!: string;
  father_name!: string;
  father_phone!: string;
  mother_name!: string;
  mother_phone!: string;
  languages!: string[];
  emergency_person_name!: string;
  emergency_person_phone!: string;
  national_id_number!: string;
  passport_number!: string;
  tin!: string;
  nssf_number!: string;
  bank_name!: string;
  bank_account_number!: string;
  primary_school_name!: string;
  primary_school_year_graduated!: number;
  seconday_school_name!: string;
  seconday_school_year_graduated!: number;
  high_school_name!: string;
  high_school_year_graduated!: number;
  degree_university_name!: string;
  degree_university_year_graduated!: number;
  masters_university_name!: string;
  masters_university_year_graduated!: number;
  phd_university_name!: string;
  phd_university_year_graduated!: number;
  user_type!: string;
  demo_id!: number;
  user_id!: number;
  user_batch_importer_id!: number;
  school_pay_account_id!: number;
  school_pay_payment_code!: string;
  given_name!: string;
  deleted_at!: Date;
  marital_status!: string;
  verification!: string;
  current_class_id!: number;
  current_theology_class_id!: number;
  status!: string;
  parent_id!: number;
  main_role_id!: number;
  stream_id!: number;
  account_id!: number;
  has_personal_info!: boolean;
  has_educational_info!: boolean;
  has_account_info!: boolean;
  diploma_school_name!: string;
  diploma_year_graduated!: number;
  certificate_school_name!: string;
  certificate_year_graduated!: number;
  company_id!: number;
  managed_by!: number;
  title!: string;
  dob!: Date;
  intro!: string;
  rate!: number;
  can_evaluate!: boolean;
  work_load_pending!: number;
  work_load_completed!: number;
  belongs_to_company!: boolean;
  card_status!: string;
  card_number!: string;
  card_balance!: number;
  card_accepts_credit!: boolean;
  card_max_credit!: number;
  card_accepts_cash!: boolean;
  is_dependent!: boolean;
  dependent_status!: string;
  dependent_id!: number;
  card_expiry!: Date;
  belongs_to_company_status!: string;

  company_name!: string;
  company_year_of_establishment!: string;
  company_employees_range!: string;
  company_country!: string;
  company_address!: string;
  company_district_id!: string;
  company_sub_county_id!: string;
  company_main_category_id!: string;
  company_sub_category_id!: string;
  company_phone_number!: string;
  company_description!: string;
  company_trade_license_no!: string;
  company_website_url!: string;
  company__email!: string;
  company__phone!: string;
  company_has_accessibility!: string;
  company_has_disability_inclusion_policy!: string;
  company_logo!: string;
  company_tax_id!: string;
  company_facebook_url!: string;
  company_linkedin_url!: string;
  company_operating_hours!: string;
  company_certifications!: string;
  company_ownership_type!: string;
  company_status!: string;
  is_company!: string;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  static fromJson(json: any): User {
    return new User(json);
  }

  toJson(): any {
    return { ...this };
  }

  static fromJsonList(jsonArray: any[]): User[] {
    return jsonArray.map((json) => User.fromJson(json));
  }

  static toJsonList(users: User[]): any[] {
    return users.map((user) => user.toJson());
  }

  async save(): Promise<void> {
    const users = User.findAll();
    const index = users.findIndex((user) => user.id === this.id);
    if (index === -1) {
      users.push(this);
    } else {
      users[index] = this;
    }
    localStorage.setItem("users", JSON.stringify(users));
  }

  async delete(): Promise<void> {
    const users = await User.findAll();
    const index = users.findIndex((user) => user.id === this.id);
    if (index !== -1) {
      users.splice(index, 1);
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  // delete all users
  async deleteAll(): Promise<void> {
    localStorage.removeItem("users");
  }

  static find(id: number): User | undefined {
    const users = User.findAll();
    return users.find((user) => user.id === id);
  }

  static findAll(): User[] {
    const usersJson = localStorage.getItem("users");
    if (usersJson) {
      return User.fromJsonList(JSON.parse(usersJson));
    }
    return [];
  }

  static findBy(key: keyof User, value: any): User | undefined {
    const users = User.findAll();
    return users.find((user) => user[key] === value);
  }

  //get first user
  static first(): User | undefined {
    const users = User.findAll();
    return users[0];
  }

  update(data: Partial<User>): void {
    Object.assign(this, data);
    this.save();
  }
}
