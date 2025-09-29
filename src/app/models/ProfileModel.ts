// src/models/ProfileModel.ts

/**
 * ProfileModel represents the structure of a user's profile.
 * Following system rules: id is integer, rest are strings with empty defaults.
 */
export class ProfileModel {
  id: number = 0;
  username: string = "";
  password: string = "";
  name: string = "";
  avatar: string = "";
  remember_token: string = "";
  created_at: string = "";
  updated_at: string = "";
  enterprise_id: string = "";
  first_name: string = "";
  last_name: string = "";
  date_of_birth: string = "";
  place_of_birth: string = "";
  sex: string = "";
  home_address: string = "";
  current_address: string = "";
  phone_number_1: string = "";
  phone_number_2: string = "";
  email: string = "";
  nationality: string = "";
  religion: string = "";
  spouse_name: string = "";
  spouse_phone: string = "";
  father_name: string = "";
  father_phone: string = "";
  mother_name: string = "";
  mother_phone: string = "";
  languages: string = "";
  emergency_person_name: string = "";
  emergency_person_phone: string = "";
  national_id_number: string = "";
  passport_number: string = "";
  tin: string = "";
  nssf_number: string = "";
  bank_name: string = "";
  bank_account_number: string = "";
  primary_school_name: string = "";
  primary_school_year_graduated: string = "";
  seconday_school_name: string = "";
  seconday_school_year_graduated: string = "";
  high_school_name: string = "";
  high_school_year_graduated: string = "";
  degree_university_name: string = "";
  degree_university_year_graduated: string = "";
  masters_university_name: string = "";
  masters_university_year_graduated: string = "";
  phd_university_name: string = "";
  phd_university_year_graduated: string = "";
  user_type: string = "";
  demo_id: string = "";
  user_id: string = "";
  user_batch_importer_id: string = "";
  school_pay_account_id: string = "";
  school_pay_payment_code: string = "";
  given_name: string = "";
  deleted_at: string = "";
  marital_status: string = "";
  verification: string = "";
  current_class_id: string = "";
  current_theology_class_id: string = "";
  status: string = "";
  parent_id: string = "";
  main_role_id: string = "";
  stream_id: string = "";
  account_id: string = "";
  has_personal_info: string = "";
  has_educational_info: string = "";
  has_account_info: string = "";
  diploma_school_name: string = "";
  diploma_year_graduated: string = "";
  certificate_school_name: string = "";
  certificate_year_graduated: string = "";
  company_id: string = "";
  managed_by: string = "";
  title: string = "";
  dob: string = "";
  intro: string = "";
  rate: string = "";
  can_evaluate: string = "";
  work_load_pending: string = "";
  work_load_completed: string = "";
  belongs_to_company: string = "";
  card_status: string = "";
  card_number: string = "";
  card_balance: string = "";
  card_accepts_credit: string = "";
  card_max_credit: string = "";
  card_accepts_cash: string = "";
  is_dependent: string = "";
  dependent_status: string = "";
  dependent_id: string = "";
  card_expiry: string = "";
  belongs_to_company_status: string = "";
  objective: string = "";
  special_qualification: string = "";
  career_summary: string = "";
  present_salary: string = "";
  expected_salary: string = "";
  expected_job_level: string = "";
  expected_job_nature: string = "";
  preferred_job_location: string = "";
  preferred_job_category: string = "";
  preferred_job_category_other: string = "";
  preferred_job_districts: string = "";
  preferred_job_abroad: string = "";
  preferred_job_countries: string = "";
  has_disability: string = "";
  is_registered_on_disability: string = "";
  disability_type: string = "";
  dificulty_to_see: string = "";
  dificulty_to_hear: string = "";
  dificulty_to_walk: string = "";
  dificulty_to_speak: string = "";
  dificulty_display_on_cv: string = "";
  country_code: string = "";
  blood_group: string = "";
  height: string = "";
  weight: string = "";
  district_id: string = "";
  district_text: string = "";

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
  submitAction: string | undefined;

  /**
   * Updates the profile fields with provided data.
   * @param data Partial data to update the profile.
   */
  updateProfile(data: Partial<ProfileModel>): void {
    Object.assign(this, data);
  }

  /**
   * Returns the full name by concatenating first and last names.
   */
  get fullName(): string {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  /**
   * Converts the ProfileModel instance to a plain object.
   * Useful for sending data to APIs.
   */
  toJSON(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        result[key] = (this as any)[key];
      }
    }
    return result;
  }

  /**
   * Creates a ProfileModel instance from a plain object.
   * Useful for initializing from API responses.
   * @param data The plain object containing profile data.
   */
  static fromJson(data: string | any): ProfileModel {
    const model = new ProfileModel();

    if (!data) {
      // If no data is provided, return the default ProfileModel instance
      return model;
    }

    try {
      // Parse the JSON string into an object if it's a string
      const obj = typeof data === 'string' ? JSON.parse(data) : data;

      // Get all keys from the ProfileModel instance
      const modelKeys = Object.keys(model);

      // Iterate through each key in the parsed JSON object
      for (const key of Object.keys(obj)) {
        if (modelKeys.includes(key)) {
          if (key === 'id') {
            // Ensure id is integer following system rules
            (model as any)[key] = parseInt(obj[key]) || 0;
          } else {
            // All other fields are strings with empty defaults
            (model as any)[key] = String(obj[key] || '');
          }
        }
      }
    } catch (error) {
      return new ProfileModel();
    }
    return model;
  }
}
