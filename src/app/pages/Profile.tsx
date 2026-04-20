import { motion } from "motion/react";
import { useState } from "react";
import { User, Mail, Phone, Calendar, GraduationCap, Save, Edit2 } from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    dateOfBirth: "1998-05-15",
    currentEducation: "Bachelor's in Computer Science",
    gpa: "3.8",
    desiredDegree: "Master's",
    preferredCountries: ["United States", "United Kingdom", "Canada"],
    fieldOfStudy: "Computer Science",
    budgetRange: "$30,000 - $50,000",
    englishProficiency: "IELTS - 7.5",
    workExperience: "2 years",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const countries = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "Japan"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Student Profile</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-8"
        >
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
            <img 
              src="https://images.unsplash.com/photo-1627556704263-b486db44a463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwcHJvZmlsZSUyMGVkdWNhdGlvbiUyMGludGVybmF0aW9uYWx8ZW58MXx8fHwxNzc2Njc2OTg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Profile Background"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-12 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl border-4 border-white shadow-lg">
                {formData.fullName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="mb-2">
                <h2 className="text-2xl text-gray-900 mb-1">{formData.fullName}</h2>
                <p className="text-gray-600">{formData.currentEducation}</p>
              </div>
            </div>
            <div className="h-px bg-gray-200 mb-8" />

            {/* Personal Information */}
            <div className="mb-8">
            <h3 className="text-lg text-gray-900 mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mb-8">
            <h3 className="text-lg text-gray-900 mb-4">Academic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-2" />
                  Current Education
                </label>
                <input
                  type="text"
                  name="currentEducation"
                  value={formData.currentEducation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">GPA / Percentage</label>
                <input
                  type="text"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Desired Degree</label>
                <select
                  name="desiredDegree"
                  value={formData.desiredDegree}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                >
                  <option>Bachelor's</option>
                  <option>Master's</option>
                  <option>PhD</option>
                  <option>Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Field of Study</label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">English Proficiency</label>
                <input
                  type="text"
                  name="englishProficiency"
                  value={formData.englishProficiency}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="e.g., IELTS 7.5, TOEFL 100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Work Experience</label>
                <input
                  type="text"
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Study Preferences */}
          <div className="mb-8">
            <h3 className="text-lg text-gray-900 mb-4">Study Preferences</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Preferred Countries</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {countries.map((country) => (
                    <label
                      key={country}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.preferredCountries.includes(country)
                          ? "bg-blue-50 border-blue-600"
                          : "border-gray-300 hover:border-gray-400"
                      } ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.preferredCountries.includes(country)}
                        disabled={!isEditing}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              preferredCountries: [...formData.preferredCountries, country],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              preferredCountries: formData.preferredCountries.filter(c => c !== country),
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{country}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Budget Range (per year)</label>
                <input
                  type="text"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>

            {/* Save Button */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
