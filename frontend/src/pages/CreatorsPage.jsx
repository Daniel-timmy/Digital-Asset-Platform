import React, { useState, useEffect, useParams } from "react";
import Card from "../components/Card";
import { useCart } from "../context/CartContext";

// Mock UserProfile data (from user_profiles table)
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

// Mock User data (from users table)
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
  // Modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [assets, setAssets] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();

  const { id } = useParams();

  // Form state for UserProfile
  const [profileForm, setProfileForm] = useState({
    ...creatorProfile,
    avatarFile: null,
    coverPhotoFile: null,
  });
  const handleAddToCart = (asset) => {
    addToCart(asset);
  };
  const handleProductClick = (product) => {
    if (!selectedProduct) setSelectedProduct(product);
  };

  const fetchAssets = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return; // Prevent fetching beyond total pages
    try {
      const resAssets = await api.get(
        `/assets?userId=${id}page=${pageNum}&limit=${limit}`
      );
      const fetchedAssets = resAssets.data.results || [];
      const newTotalPages = resAssets.data.totalPages || 1;

      setAssets((prev) =>
        append ? [...prev, ...fetchedAssets] : fetchedAssets
      );
      setTotalPages(newTotalPages);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setApiError("Failed to load assets. Please try again.");
    }
  };
  // Form state for User
  const [userForm, setUserForm] = useState({ ...user });

  // Handlers for UserProfile modal
  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatarFile" || name === "coverPhotoFile") {
      setProfileForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setProfileForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Handlers for User modal
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((f) => ({ ...f, [name]: value }));
  };

  // Dummy submit handlers
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // TODO: send profileForm to API
    setShowProfileModal(false);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    // TODO: send userForm to API
    setShowUserModal(false);
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Cover Photo */}
      {creatorProfile.coverPhoto && (
        <img
          src={creatorProfile.coverPhoto}
          alt="Cover"
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", marginTop: -60 }}>
        {/* Avatar */}
        <img
          src={creatorProfile.avatarUrl}
          alt="Avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "4px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            background: "#fff",
          }}
        />
        <div style={{ marginLeft: 24 }}>
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <div style={{ color: "#888", fontSize: 18 }}>
            {creatorProfile.title}
          </div>
          <div
            style={{
              color: user.status === "active" ? "green" : "red",
              fontWeight: 500,
            }}
          >
            {user.status === "active" ? "Active" : "Closed"}
          </div>
          <div style={{ color: "#555", fontSize: 16, marginTop: 4 }}>
            Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
          <div style={{ color: "#aaa", fontSize: 14, marginTop: 2 }}>
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginTop: 24 }}>
        <h3>Description</h3>
        <p>{creatorProfile.description}</p>
      </div>

      {/* Interests */}
      {creatorProfile.interest && creatorProfile.interest.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Interests</h3>
          <ul
            style={{ display: "flex", gap: 12, listStyle: "none", padding: 0 }}
          >
            {creatorProfile.interest.map((interest) => (
              <li
                key={interest}
                style={{
                  background: "#eee",
                  borderRadius: 16,
                  padding: "4px 12px",
                }}
              >
                {interest}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Social Links */}
      <div style={{ marginTop: 16 }}>
        <h3>Social Links</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {socialLinks.map(
            (link) =>
              link.value && (
                <li key={link.label}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}: @{link.value}
                  </a>
                </li>
              )
          )}
        </ul>
      </div>

      {/* Contact Info */}
      <div style={{ marginTop: 16 }}>
        <h3>Contact Information</h3>
        <div>Address: {creatorProfile.address}</div>
        <div>Phone: {creatorProfile.phone}</div>
        <div>Email: {user.email}</div>
      </div>

      {/* Edit buttons */}
      <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
        <button onClick={() => setShowProfileModal(true)}>Edit Profile</button>
        <button onClick={() => setShowUserModal(true)}>Edit Account</button>
      </div>

      {/* UserProfile Modal */}
      {showProfileModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 350,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            }}
            onSubmit={handleProfileSubmit}
          >
            <h2>Edit Profile</h2>
            <label>
              Title:
              <input
                name="title"
                value={profileForm.title}
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              Description:
              <textarea
                name="description"
                value={profileForm.description}
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              Interests (comma separated):
              <input
                name="interest"
                value={profileForm.interest.join(", ")}
                onChange={(e) =>
                  setProfileForm((f) => ({
                    ...f,
                    interest: e.target.value.split(",").map((s) => s.trim()),
                  }))
                }
              />
            </label>
            <br />
            <label>
              Instagram:
              <input
                name="instagram"
                value={profileForm.instagram}
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              X:
              <input
                name="x"
                value={profileForm.x}
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              Facebook:
              <input
                name="facebook"
                value={profileForm.facebook}
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              Address:
              <input
                name="address"
                value={profileForm.address}
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              Phone:
              <input
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              Avatar:
              <input
                type="file"
                name="avatarFile"
                accept="image/*"
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <label>
              Cover Photo:
              <input
                type="file"
                name="coverPhotoFile"
                accept="image/*"
                onChange={handleProfileChange}
              />
            </label>
            <br />
            <div style={{ marginTop: 16 }}>
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{ marginLeft: 8 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 350,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            }}
            onSubmit={handleUserSubmit}
          >
            <h2>Edit Account</h2>
            <label>
              Name:
              <input
                name="name"
                value={userForm.name}
                onChange={handleUserChange}
              />
            </label>
            <br />
            <label>
              Email:
              <input
                name="email"
                value={userForm.email}
                onChange={handleUserChange}
              />
            </label>
            <br />
            <label>
              Status:
              <select
                name="status"
                value={userForm.status}
                onChange={handleUserChange}
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <br />
            <label>
              Role:
              <select
                name="role"
                value={userForm.role}
                onChange={handleUserChange}
              >
                <option value="creator">Creator</option>
                <option value="consumer">Consumer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <br />
            <div style={{ marginTop: 16 }}>
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                style={{ marginLeft: 8 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assets Section */}
      <div style={{ marginTop: 32 }}>
        <h3>Assets</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {assets.length === 0 ? (
            <div>No assets found.</div>
          ) : (
            assets.map((asset) => (
              <Card
                key={asset.id}
                product={asset}
                onAddToCart={handleAddToCart}
                handleProductClick={handleProductClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
