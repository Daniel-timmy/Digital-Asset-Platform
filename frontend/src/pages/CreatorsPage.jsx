import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import api from "../utils/api";
import LoadingIndicator from "../components/LoadingIndicator";
import Card from "../components/Card";
import MasonryGrid from "../components/MasonryGrid";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CreatorsPage = () => {
  const { id } = useParams();
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [assetsError, setAssetsError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const { addToCart } = useCart();
  const observer = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchAssets(1, false);
  }, [id]);

  useEffect(() => {
    if (pagination.page > 1) {
      fetchAssets(pagination.page, true);
    }
  }, [pagination.page]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoadingAssets &&
          pagination.page < pagination.totalPages
        ) {
          setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current && observer.current) {
        observer.current.unobserve(loadMoreRef.current);
      }
    };
  }, [isLoadingAssets, pagination.page, pagination.totalPages]);


  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const res = await api.get(`/user-profile/user/${id}`);
      setCreatorProfile(res.data);
    } catch (err) {
      console.warn("Profile not found, attempting to fetch user details...", err);
      try {
        const userRes = await api.get(`/users/${id}`);
        setCreatorProfile({
          user: userRes.data,
          title: "Content Creator",
          description: "No bio available.",
          interest: [],
          instagram: "",
          x: "",
          facebook: "",
          address: "",
          phone: "",
          avatarUrl: null,
          coverPhoto: null
        });
        setProfileError("");
      } catch (userErr) {
        console.error("Error fetching user:", userErr);
        setProfileError("Creator not found.");
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchAssets = async (pageNum = 1, append = false) => {
    if (pageNum > pagination.totalPages && append) return;

    try {
      setIsLoadingAssets(true);
      // Assuming GET /assets accepts userId filter
      const res = await api.get(
        `/assets?userId=${id}&page=${pageNum}&limit=${pagination.limit}`
      );

      const fetchedAssets = res.data.results || [];
      const newTotalPages = res.data.totalPages || 1;

      setAssets((prev) =>
        append ? [...prev, ...fetchedAssets] : fetchedAssets
      );
      setPagination((prev) => ({
        ...prev,
        totalPages: newTotalPages,
      }));
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssetsError("Failed to load products.");
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleAddToCart = (asset) => {
    addToCart(asset);
  };

  if (isLoadingProfile) {
    return <LoadingIndicator />;
  }

  if (profileError || !creatorProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-2xl">
            <p className="text-red-500 font-medium">{profileError || "Profile not found"}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Cover Photo */}
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg bg-gray-200">
          {creatorProfile.coverPhoto ? (
            <img
              src={creatorProfile.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Profile Header */}
        <div className="relative -mt-32 md:-mt-40 px-4 md:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={creatorProfile.avatarUrl || "https://via.placeholder.com/150"}
                  alt="Avatar"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 mt-4 md:mt-0">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {creatorProfile.user?.name}
                </h1>
                <p className="text-lg text-blue-600 font-medium mt-1">
                  {creatorProfile.title || "Content Creator"}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{creatorProfile.address || "Location Hidden"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{creatorProfile.user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-8">
          {/* Left Sidebar - About & Info */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed">
                {creatorProfile.description || "No description provided."}
              </p>
            </div>

            {/* Socials */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connect</h3>
              <div className="space-y-3">
                {socialLinks.map((link) =>
                  link.value && (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <span className="font-bold">{link.label[0]}</span>
                      </div>
                      <span className="font-medium text-gray-700">{link.label}</span>
                    </a>
                  )
                )}
                {!socialLinks.some(l => l.value) && <p className="text-gray-400 italic">No social links.</p>}
              </div>
            </div>

            {/* Interests */}
            {creatorProfile.interest && creatorProfile.interest.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {creatorProfile.interest.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Products */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CubeIcon className="w-7 h-7 text-blue-600" />
                Products
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {assets.length}+ Items
              </span>
            </div>

            {assets.length === 0 && !isLoadingAssets ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CubeIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No products yet</h3>
                <p className="text-gray-500">This creator hasn't uploaded any products.</p>
              </div>
            ) : (
              <div className="min-h-[200px]">
                <MasonryGrid>
                  {assets.map((asset) => (
                    <Card
                      key={asset.id}
                      product={asset}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </MasonryGrid>

                {/* Loading More Indicator */}
                {isLoadingAssets && (
                  <div className="py-8 flex justify-center">
                    <LoadingIndicator />
                  </div>
                )}

                {/* Infinite Scroll Trigger */}
                <div ref={loadMoreRef} className="h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatorsPage;
