import React, { useState } from "react";
import {
  UserCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const creatorProfile = {
  avatarUrl: "https://via.placeholder.com/120",
  coverPhoto: "https://via.placeholder.com/600x200",
  title: "Content Creator",
  description: "Passionate about creating engaging content for all audiences.",
  interest: ["Photography", "Travel", "Tech"],
  instagram: "janedoe_insta",
  x: "janedoe_x",
  facebook: "janedoe.fb",
  address: "123 Main St, City, Country",
  phone: "+1234567890",
};

const user = {
  name: "Jane Doe",
  email: "jane.doe@email.com",
  status: "active",
  role: "creator",
  created_at: "2024-06-01T10:00:00Z",
};

const socialLinks = [
  {
    label: "Instagram",
    value: creatorProfile.instagram,
    url: creatorProfile.instagram
      ? `https://instagram.com/${creatorProfile.instagram}`
      : null,
  },
  {
    label: "X",
    value: creatorProfile.x,
    url: creatorProfile.x ? `https://x.com/${creatorProfile.x}` : null,
  },
  {
    label: "Facebook",
    value: creatorProfile.facebook,
    url: creatorProfile.facebook
      ? `https://facebook.com/${creatorProfile.facebook}`
      : null,
  },
];

const CreatorProfile = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const [profileForm, setProfileForm] = useState({
    ...creatorProfile,
    avatarFile: null,
    coverPhotoFile: null,
  });

  const [userForm, setUserForm] = useState({ ...user });

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatarFile" || name === "coverPhotoFile") {
      setProfileForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setProfileForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((f) => ({ ...f, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setShowProfileModal(false);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setShowUserModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cover Photo */}
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg">
        <img
          src={creatorProfile.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Profile Header */}
      <div className="relative -mt-32 px-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={creatorProfile.avatarUrl}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-lg text-gray-600 mt-1">
                {creatorProfile.title}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    user.status === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {user.status === "active" ? "Active" : "Closed"}
                </span>
                <span className="text-sm text-gray-500">
                  Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="text-sm text-gray-400">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Edit Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <PencilSquareIcon className="w-5 h-5" />
                Edit Profile
              </button>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                <PencilSquareIcon className="w-5 h-5" />
                Edit Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
        {/* About Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
            <p className="text-gray-600 leading-relaxed">
              {creatorProfile.description}
            </p>
          </div>

          {/* Interests */}
          {creatorProfile.interest && creatorProfile.interest.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Interests
              </h3>
              <div className="flex flex-wrap gap-3">
                {creatorProfile.interest.map((interest) => (
                  <span
                    key={interest}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Social Links
            </h3>
            <div className="space-y-3">
              {socialLinks.map(
                (link) =>
                  link.value && (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-blue-600 font-semibold">
                          {link.label.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {link.label}
                        </p>
                        <p className="text-sm text-gray-500">@{link.value}</p>
                      </div>
                    </a>
                  )
              )}
            </div>
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {creatorProfile.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <PhoneIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {creatorProfile.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  name="title"
                  value={profileForm.title}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={profileForm.description}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interests (comma separated)
                </label>
                <input
                  name="interest"
                  value={profileForm.interest.join(", ")}
                  onChange={(e) =>
                    setProfileForm((f) => ({
                      ...f,
                      interest: e.target.value.split(",").map((s) => s.trim()),
                    }))
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    name="instagram"
                    value={profileForm.instagram}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    X (Twitter)
                  </label>
                  <input
                    name="x"
                    value={profileForm.x}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    name="facebook"
                    value={profileForm.facebook}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Account</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  name="name"
                  value={userForm.name}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  value={userForm.email}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={userForm.status}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="creator">Creator</option>
                  <option value="consumer">Consumer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfile;