"use client";
import { useState, useEffect } from "react";
import { ApiHelper } from "@/utils/api";
import { AuthUtils } from "@/utils/auth";
import { Product, Category, Unit, CreateProductRequest } from "@/types/product";
import toast from "react-hot-toast";

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const itemsPerPage = 10;
  useEffect(() => {
    fetchData(1, "");
  }, []);

  useEffect(() => {
    fetchData(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.XLSX) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => setXlsxLoaded(true);
      document.head.appendChild(script);
    } else if (window.XLSX) {
      setXlsxLoaded(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchData(1, searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async (
    page: number = currentPage,
    query: string = searchQuery
  ) => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error("Vui lòng đăng nhập");
        window.location.href = "/login";
        return;
      }

      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(itemsPerPage));
      if (query.trim()) params.append("search", query.trim());

      const [productsRes, categoriesRes, unitsRes] = await Promise.all([
        ApiHelper.get<any>(`api/v1/products?${params.toString()}`),
        ApiHelper.get<Category[]>("api/v1/categories"),
        ApiHelper.get<Unit[]>("api/v1/units"),
      ]);
      console.log("Product:", productsRes);

      if (productsRes.success) {
        console.log("FULL RESPONSE:", productsRes);

        const rawData = productsRes.data || {};
        const productList = Array.isArray(rawData.data)
          ? rawData.data
          : Array.isArray(productsRes.data)
          ? productsRes.data
          : [];

        const pagi = rawData.pagination || productsRes.pagination || {};

        setProducts(productList);
        setTotalItems(pagi.totalItems || productList.length);
        setTotalPages(pagi.totalPages || 1);
      }

      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      if (unitsRes.success) setUnits(unitsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: CreateProductRequest) => {
    try {
      const response = await ApiHelper.post("api/v1/products", data);
      if (response.success) {
        toast.success("Thêm sản phẩm thành công!");
        fetchData();
        return true;
      }
      toast.error("Lỗi: " + (response.message || "Không thể lưu sản phẩm"));
      return false;
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error("Lỗi: " + error.message);
      return false;
    }
  };

  const updateProduct = async (
    id: string,
    data: CreateProductRequest
  ): Promise<boolean> => {
    try {
      const payload: any = {
        name: data.name?.trim(),
        slug: data.slug?.trim(),
        category_id: data.category_id ? Number(data.category_id) : undefined,
        unit_id: data.unit_id ? Number(data.unit_id) : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
        stock_quantity:
          data.stock_quantity !== undefined
            ? Number(data.stock_quantity)
            : undefined,
        compare_price:
          data.compare_price !== undefined ? Number(data.compare_price) : null,
        short_description: data.short_description?.trim() || "",
        description: data.description?.trim() || "",
        origin: data.origin?.trim() || "Việt Nam",
        is_active: data.is_active,
        is_featured: data.is_featured,
        images: data.images || { thumbnail: "", gallery: [] },
      };

      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      const response = await ApiHelper.patch(`api/v1/products/${id}`, payload);
      if (response.success) {
        toast.success("Cập nhật thành công!");
        fetchData();
        return true;
      }
      toast.error("Lỗi: " + (response.message || "Không thể cập nhật"));
      return false;
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
      return false;
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!product || !product.id) {
      toast.error("Dữ liệu sản phẩm không hợp lệ");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) return;

    try {
      const response = await ApiHelper.delete(`api/v1/products/${product.id}`);
      if (response.success) {
        toast.success("Xóa sản phẩm thành công!");
        fetchData();
      } else {
        toast.error("Lỗi: " + (response.message || "Không thể xóa sản phẩm"));
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Lỗi: " + error.message);
    }
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      toast.loading("Đang tải thư viện Excel...");
      return;
    }

    const exportData = filteredProducts.map((product) => ({
      ID: product.id,
      "Tên Sản Phẩm": product.name,
      SKU: product.sku,
      "Danh Mục": product.category_name,
      "Đơn Vị": product.unit_name,
      "Giá Bán": product.price,
      "Giá So Sánh": product.compare_price || "",
      "Tồn Kho": product.stock_quantity,
      "Xuất Xứ": product.origin,
      "Trạng Thái": product.is_active ? "Hoạt động" : "Tạm dừng",
      "Nổi Bật": product.is_featured ? "Có" : "Không",
      "Ngày Tạo": new Date(product.created_at).toLocaleDateString("vi-VN"),
    }));

    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Sản Phẩm");

    ws["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
    ];

    window.XLSX.writeFile(
      wb,
      `san-pham_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.XLSX) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const wb = window.XLSX.read(event.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(ws);

        if (jsonData.length === 0) {
          toast.error("File Excel trống");
          return;
        }

        const importData = jsonData.map((row: any) => {
          const category = categories.find(
            (c) => c.name.toLowerCase() === row["Danh Mục"]?.toLowerCase()
          );

          const unit = units.find(
            (u) => u.name.toLowerCase() === row["Đơn Vị"]?.toLowerCase()
          );

          return {
            name: row["Tên Sản Phẩm"] || "",
            slug: row["SKU"]?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "",
            category_id: category ? parseInt(category.id) : 1,
            unit_id: unit ? parseInt(unit.id) : 1,
            price: parseFloat(row["Giá Bán"]) || 0,
            stock_quantity: parseInt(row["Tồn Kho"]) || 0,
            short_description: row["Mô Tả Ngắn"] || "",
            description: row["Mô Tả Chi Tiết"] || "",
            origin: row["Xuất Xứ"] || "Việt Nam",
            is_active: row["Trạng Thái"] === "Hoạt động",
            is_featured: row["Nổi Bật"] === "Có",
            compare_price: row["Giá So Sánh"]
              ? parseFloat(row["Giá So Sánh"])
              : undefined,
          };
        });

        if (!confirm(`Import ${importData.length} sản phẩm?`)) return;

        let success = 0,
          error = 0;
        for (const product of importData) {
          try {
            const res = await ApiHelper.post("api/v1/products", product);
            if (res.success) success++;
            else error++;
          } catch {
            error++;
          }
        }

        alert(`Thành công: ${success}\nThất bại: ${error}`);
        fetchData();
      } catch (error) {
        toast.error("Lỗi đọc file Excel");
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const filteredProducts = products;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products;

  return {
    products,
    categories,
    units,
    filteredProducts,
    currentProducts,
    loading,
    currentPage,
    searchQuery,
    xlsxLoaded,
    totalPages,
    totalItems,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchData,
    createProduct,
    updateProduct,
    deleteProduct,
    handleExportExcel,
    handleImportExcel,
  };
}