import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      navigate("/products");
    } else {
      setProduct(data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.product_name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) navigate("/products");
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (!product) return null;
  // build image URL from storage if image_url is empty
  const imageUrl = //product.image_url ||
    `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.product_code}.jpeg`

    
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">

        <div className="page-header">
          <button className="btn-back" onClick={() => navigate("/products")}>
            ← Back
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-primary"
              onClick={() => navigate(`/products/edit/${id}`)}
            >
              Edit
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <div className="form-card">


          {/* Image */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <img
              src={imageUrl}
              alt={product.product_name}
              style={{
                width: "160px", height: "160px",
                objectFit: "cover", borderRadius: "12px",
                border: "1px solid #ddd",
              }}
              onError={(e) => {
                // fallback to emoji if image fails to load
                e.target.style.display = "none"
                e.target.nextSibling.style.display = "flex"
              }}
            />
            <div style={{
              display: "none",
              width: "160px", height: "160px",
              background: "#f1f5f9", borderRadius: "12px",
              alignItems: "center", justifyContent: "center",
              fontSize: "48px", margin: "0 auto",
            }}>
              📦
            </div>
          </div>

          <div className="view-grid">

            <div className="view-field">
              <span className="view-label">Product Name</span>
              <span className="view-value">{product.product_name}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Category</span>
              <span className="view-value">{product.category || "—"}</span>
            </div>

            <div className="view-field">
              <span className="view-label">SKU / Code</span>
              <span className="view-value">{product.product_code || "—"}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Barcode</span>
              <span className="view-value">{product.barcode || "—"}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Brand</span>
              <span className="view-value">{product.brand || "—"}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Unit</span>
              <span className="view-value">{product.unit || "—"}</span>
            </div>

            {/* Purchase Price — admin only */}
            {role === "admin" && (
              <div className="view-field">
                <span className="view-label">🔒 Purchase Price</span>
                <span className="view-value" style={{ color: "#dc2626" }}>
                  ₹{Number(product.purchase_price || 0).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="view-field">
              <span className="view-label">Selling Price</span>
              <span className="view-value" style={{ color: "#16a34a", fontWeight: "bold" }}>
                ₹{Number(product.selling_price || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Stock Quantity</span>
              <span
                className="view-value"
                style={{ color: product.quantity <= product.reorder_level ? "#dc2626" : "#0f172a" }}
              >
                {product.quantity}
                {product.quantity <= product.reorder_level && (
                  <span style={{
                    marginLeft: "8px", background: "#fee2e2",
                    color: "#dc2626", fontSize: "12px",
                    padding: "2px 8px", borderRadius: "20px",
                  }}>
                    Low Stock
                  </span>
                )}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Reorder Level</span>
              <span className="view-value">{product.reorder_level ?? "—"}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Location</span>
              <span className="view-value">{product.location || "—"}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Added On</span>
              <span className="view-value">
                {new Date(product.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Last Updated</span>
              <span className="view-value">
                {new Date(product.last_updated).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;