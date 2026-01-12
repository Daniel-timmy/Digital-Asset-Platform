import React, { useState, useEffect } from "react";
import {
    PencilSquareIcon,
    XMarkIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { USER } from "../../utils/constants";
import LoadingIndicator from "../../components/LoadingIndicator";

const ClientProfile = () => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [clientProfile, setClientProfile] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem(USER) || "{}"));

    const [profileForm, setProfileForm] = useState({
        title: "",
        description: "",
        interest: [],
        instagram: "",
        x: "",
        facebook: "",
        address: "",
        phone: "",
        profileImage: null,
        coverImage: null,
    });

    const [userForm, setUserForm] = useState({ ...user });

    // Email Change State
    const [emailStep, setEmailStep] = useState(0);
    const [emailForm, setEmailForm] = useState({
        newEmail: "",
        password: "",
        code: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/user-profile/user/${user.id}`);
            setClientProfile(res.data);
            setProfileForm({
                title: res.data.title || "",
                description: res.data.description || "",
                interest: res.data.interest || [],
                instagram: res.data.instagram || "",
                x: res.data.x || "",
                facebook: res.data.facebook || "",
                address: res.data.address || "",
                phone: res.data.phone || "",
                profileImage: null,
                coverImage: null,
            });
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Failed to load profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "profileImage" || name === "coverImage") {
            setProfileForm((f) => ({ ...f, [name]: files[0] }));
        } else {
            setProfileForm((f) => ({ ...f, [name]: value }));
        }
    };

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUserForm((f) => ({ ...f, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", profileForm.title);
            formData.append("description", profileForm.description);
            profileForm.interest.forEach(item => formData.append("interest", item));

            formData.append("instagram", profileForm.instagram);
            formData.append("x", profileForm.x);
            formData.append("facebook", profileForm.facebook);
            formData.append("address", profileForm.address);
            formData.append("phone", profileForm.phone);

            if (profileForm.profileImage) {
                formData.append("profileImage", profileForm.profileImage);
            }
            if (profileForm.coverImage) {
                formData.append("coverImage", profileForm.coverImage);
            }

            await api.put(`/user-profile/${clientProfile.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccessMessage("Profile updated successfully!");
            fetchProfile();
            setShowProfileModal(false);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const payload = {
                name: userForm.name,
            };

            if (userForm.password && userForm.oldPassword) {
                payload.password = userForm.password;
                payload.oldPassword = userForm.oldPassword;
            }

            const res = await api.patch("/users/me", payload);
            setUser(res.data);
            localStorage.setItem(USER, JSON.stringify(res.data));
            setSuccessMessage("Account updated successfully!");
            setShowUserModal(false);
            setUserForm(prev => ({ ...prev, password: "", oldPassword: "" }));
            fetchProfile();
        } catch (err) {
            console.error("Error updating account:", err);
            setError(err.response?.data?.message || "Failed to update account.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailFormChange = (e) => {
        const { name, value } = e.target;
        setEmailForm((f) => ({ ...f, [name]: value }));
    };

    const handleEmailRequest = async () => {
        setError("");
        setSuccessMessage("");
        setIsLoading(true);
        try {
            await api.post("/users/change-email", {
                newEmail: emailForm.newEmail,
                oldEmail: user.email,
                password: emailForm.password,
            });
            setEmailStep(2);
            setSuccessMessage(`Verification code sent to ${emailForm.newEmail}`);
        } catch (err) {
            console.error("Error requesting email change:", err);
            setError(err.response?.data?.message || "Failed to request email change.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailConfirm = async () => {
        setError("");
        setSuccessMessage("");
        setIsLoading(true);
        try {
            await api.post("/users/confirm-email", { code: emailForm.code });
            setSuccessMessage("Email updated successfully!");

            const updatedUser = { ...user, email: emailForm.newEmail };
            setUser(updatedUser);
            localStorage.setItem(USER, JSON.stringify(updatedUser));
            setUserForm((prev) => ({ ...prev, email: emailForm.newEmail }));

            setEmailStep(0);
            setEmailForm({ newEmail: "", password: "", code: "" });
        } catch (err) {
            console.error("Error confirming email change:", err);
            setError(err.response?.data?.message || "Failed to verify email change.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !clientProfile) {
        return <LoadingIndicator />;
    }

    if (!clientProfile) {
        return <div className="p-8 text-center text-red-500">Profile not found.</div>;
    }

    const socialLinks = [
        {
            label: "Instagram",
            value: clientProfile.instagram,
            url: clientProfile.instagram
                ? `https://instagram.com/${clientProfile.instagram}`
                : null,
        },
        {
            label: "X",
            value: clientProfile.x,
            url: clientProfile.x ? `https://x.com/${clientProfile.x}` : null,
        },
        {
            label: "Facebook",
            value: clientProfile.facebook,
            url: clientProfile.facebook
                ? `https://facebook.com/${clientProfile.facebook}`
                : null,
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cover Photo */}
            <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg bg-gray-200">
                {clientProfile.coverPhoto ? (
                    <img
                        src={clientProfile.coverPhoto}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Profile Header */}
            <div className="relative -mt-32 px-6">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={clientProfile.avatarUrl || "https://via.placeholder.com/150"}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-4 border-white flex items-center justify-center">
                                <CheckCircleIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{clientProfile.user?.name || user.name}</h1>
                            <p className="text-lg text-gray-600 mt-1">
                                {clientProfile.title || "No Title Set"}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${user.status === "active"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-red-50 text-red-600"
                                        }`}
                                >
                                    {user.status === "active" ? "Active" : "Closed"}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Role: {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : ''}
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
                            {clientProfile.description || "No description provided."}
                        </p>
                    </div>

                    {/* Interests */}
                    {clientProfile.interest && clientProfile.interest.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Interests
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {clientProfile.interest.map((interest, idx) => (
                                    <span
                                        key={idx}
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
                                                <p className="text-sm text-gray-500">{link.value}</p>
                                            </div>
                                        </a>
                                    )
                            )}
                            {!socialLinks.some(l => l.value) && <p className="text-gray-500">No social links added.</p>}
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
                                        {clientProfile.address || "N/A"}
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
                                        {clientProfile.phone || "N/A"}
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
                                        {clientProfile.user?.email || user.email}
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
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                                    <input type="file" name="profileImage" onChange={handleProfileChange} accept="image/*" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                    <input type="file" name="coverImage" onChange={handleProfileChange} accept="image/*" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
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

            {/* User Modal - View Only */}
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email
                                    </label>
                                    {emailStep === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setEmailStep(1)}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Change Email
                                        </button>
                                    )}
                                </div>
                                {emailStep === 0 ? (
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed">
                                        {userForm.email}
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4 animate-fade-in">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-blue-900">
                                                {emailStep === 1
                                                    ? "Request Email Change"
                                                    : "Verify New Email"}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEmailStep(0);
                                                    setEmailForm({
                                                        newEmail: "",
                                                        password: "",
                                                        code: "",
                                                    });
                                                    setError("");
                                                    setSuccessMessage("");
                                                }}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {emailStep === 1 ? (
                                            <div className="space-y-3">
                                                <input
                                                    name="newEmail"
                                                    value={emailForm.newEmail}
                                                    onChange={handleEmailFormChange}
                                                    placeholder="New Email Address"
                                                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={emailForm.password}
                                                    onChange={handleEmailFormChange}
                                                    placeholder="Current Password"
                                                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleEmailRequest}
                                                    disabled={isLoading}
                                                    className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                                >
                                                    {isLoading ? "Sending..." : "Send Verification Code"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-sm text-blue-800">
                                                    Please enter the verification code sent to{" "}
                                                    {emailForm.newEmail}
                                                </p>
                                                <input
                                                    name="code"
                                                    value={emailForm.code}
                                                    onChange={handleEmailFormChange}
                                                    placeholder="Verification Code"
                                                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleEmailConfirm}
                                                    disabled={isLoading}
                                                    className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                                >
                                                    {isLoading ? "Verifying..." : "Verify & Change"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Old Password
                                </label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={userForm.oldPassword || ""}
                                    onChange={handleUserChange}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={userForm.password || ""}
                                    onChange={handleUserChange}
                                    placeholder="Enter new password (optional)"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
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

export default ClientProfile;
