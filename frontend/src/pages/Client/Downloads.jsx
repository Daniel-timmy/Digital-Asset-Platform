import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const DownloadCard = ({ download }) => {
  const { asset, created_at, downloaded_at, license } = download;
  console.log("License Data:", download);

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Thumbnail */}
        <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={asset.thumbnail_url}
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              {asset.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {asset.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DocumentIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">File Type</p>
                  <p className="font-semibold text-gray-900">
                    {asset.file_type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Price</p>
                  <p className="font-semibold text-gray-900">
                    ${parseFloat(asset.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <CalendarIcon className="w-4 h-4" />
              <span>
                Downloaded:{" "}
                {new Date(downloaded_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <a
            href={license?.downloadUrl}
            download
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl group"
          >
            <ArrowDownTrayIcon className="w-5 h-5 group-hover:animate-bounce" />
            Download File
          </a>
        </div>
      </div>
    </div>
  );
};

const Downloads = () => {
  const [errors, setErrors] = useState("");
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const observer = useRef(null);
  const loadMoreRef = useRef(null);

  const getDownloads = async (pageNum = 1, append = false) => {
    if (pageNum > totalPages && append) return;
    setLoading(true);
    try {
      const res = await api.get(`/downloads?page=${pageNum}&limit=${limit}`);
      const newDownloads = res.data.results || [];
      const newTotalPages = res.data.totalPages || 1;

      setDownloads((prev) =>
        append ? [...prev, ...newDownloads] : newDownloads
      );
      setTotalPages(newTotalPages);
    } catch (error) {
      setErrors(
        error.response?.data?.message ||
          "Failed to load downloads. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDownloads(page, page > 1);
  }, [page]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          setPage((prev) => prev + 1);
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
  }, [loading, page, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <ArrowDownTrayIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Downloads</h2>
            <p className="text-gray-500 text-sm mt-1">
              Access all your purchased and downloaded files
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errors && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
          <p className="text-red-800 text-sm">{errors}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && downloads.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <LoadingIndicator />
        </div>
      )}

      {/* Empty State */}
      {!loading && downloads.length === 0 && !errors && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowDownTrayIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Downloads Yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Your downloaded files will appear here. Start exploring our catalog
            to find amazing content!
          </p>
        </div>
      )}

      {/* Downloads Grid */}
      <div className="space-y-6">
        {downloads.map((download, index) => (
          <div
            key={download.id}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <DownloadCard download={download} />
          </div>
        ))}
      </div>

      {/* Sentinel for Infinite Scrolling */}
      {page < totalPages && (
        <div
          ref={loadMoreRef}
          className="h-16 flex justify-center items-center"
        >
          {loading && <LoadingIndicator />}
        </div>
      )}
    </div>
  );
};

export default Downloads;