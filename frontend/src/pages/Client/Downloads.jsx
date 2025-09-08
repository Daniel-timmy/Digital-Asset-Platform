import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import LoadingIndicator from "../../components/LoadingIndicator";

const DownloadCard = ({ download }) => {
  const { asset, created_at, downloaded_at } = download;

  return (
    <div
      className="download-card"
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "16px",
        margin: "16px 0",
        maxWidth: "600px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", gap: "16px" }}>
        <img
          src={asset.thumbnail_url}
          alt={asset.name}
          style={{
            width: "150px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>{asset.name}</h3>
          <p style={{ margin: "4px 0", color: "#666" }}>{asset.description}</p>
          <p style={{ margin: "4px 0", color: "#666" }}>
            File Type: {asset.file_type}
          </p>
          <p style={{ margin: "4px 0", color: "#666" }}>
            Price: ${parseFloat(asset.price).toFixed(2)}
          </p>
          <p style={{ margin: "4px 0", color: "#666" }}>
            Downloaded:{" "}
            {new Date(downloaded_at).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
          <a
            href={asset.file_url}
            download
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {loading && <LoadingIndicator />}

      {errors && (
        <div
          style={{
            color: "red",
            margin: "10px 0",
            padding: "10px",
            background: "#ffe6e6",
            borderRadius: "4px",
          }}
        >
          {errors}
        </div>
      )}

      {!loading && downloads.length === 0 && !errors && (
        <p>No downloads found.</p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {downloads.map((download) => (
          <DownloadCard key={download.id} download={download} />
        ))}
      </div>

      {/* Sentinel for Infinite Scrolling */}
      {page < totalPages && (
        <div
          ref={loadMoreRef}
          style={{
            height: "40px",
            display: "flex",
            justifyContent: "center",
            padding: "16px 0",
          }}
        >
          {loading && <LoadingIndicator />}
        </div>
      )}
    </div>
  );
};

export default Downloads;
