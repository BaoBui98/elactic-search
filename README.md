# 📚 Hướng Dẫn Toàn Diện Cú Pháp Search Trong Elasticsearch (Từ Cơ Bản Đến Nâng Cao)

Tài liệu này tổng hợp toàn bộ các cú pháp truy vấn (Query DSL) trong Elasticsearch theo thứ tự từ cơ bản nhất đến các kỹ thuật nâng cao được dùng trong các dự án thực tế (E-commerce, Log Analytics, v.v.).

Bạn có thể chạy thử trực tiếp các câu lệnh này trong **Kibana Dev Tools** (`http://localhost:5601`) hoặc qua lệnh `curl`.

---

## 📑 Mục Lục
1. [Khái niệm cốt lõi: Text vs Keyword, Query Context vs Filter Context](#1-khái-niệm-cốt-lõi)
2. [Truy vấn Cơ bản (Basic Queries)](#2-truy-vấn-cơ-bản)
   - `match_all`
   - `term` & `terms` (Tìm kiếm chính xác)
   - `range` (Lọc theo khoảng giá, ngày tháng)
   - `exists` (Kiểm tra trường tồn tại)
   - `prefix`, `wildcard`, `fuzzy` (Tìm kiếm mờ/gần đúng)
3. [Truy vấn Toàn văn (Full-Text Queries)](#3-truy-vấn-toàn-văn-full-text-queries)
   - `match`
   - `match_phrase` & `match_phrase_prefix`
   - `multi_match` (Tìm trên nhiều trường & Boosting `^`)
4. [Truy vấn Kết hợp Logic (Compound Queries - `bool`)](#4-truy-vấn-kết-hợp-logic-bool-query)
   - `must`, `filter`, `should`, `must_not`
   - Kỹ thuật tính điểm liên quan (Relevance Scoring)
5. [Phân trang, Sắp xếp & Chọn trường hiển thị](#5-phân-trang-sắp-xếp--field-selection)
   - `from` / `size`
   - `search_after` (Phân trang dữ liệu lớn Deep Pagination)
   - `sort`
   - `_source` filtering
6. [Highlighting (Làm nổi bật từ khóa tìm kiếm)](#6-highlighting)
7. [Truy vấn Nâng cao (Advanced Queries)](#7-truy-vấn-nâng-cao)
   - `nested` query (Tìm kiếm trong mảng Object)
   - Autocomplete / Suggesters
   - Function Score Query (Tự điều chỉnh điểm ranking)
8. [Aggregations (Thống kê / Phân tích dữ liệu)](#8-aggregations-thống-kê)
   - Metrics Aggregations (`avg`, `sum`, `stats`)
   - Bucket Aggregations (`terms`, `histogram`, `date_histogram`)

---

## 1. Khái niệm cốt lõi

Trước khi viết query, bạn cần phân biệt 2 cặp khái niệm quan trọng nhất:

### A. `text` vs `keyword`
* **`text`**: Được bộ phân tích (**Analyzer**) bóc tách từ ngữ thành các tokens, chuyển thành chữ thường, bỏ dấu,... Dùng cho tìm kiếm toàn văn (**Full-Text Search**) trên các trường như: tiêu đề, mô tả, nội dung bài viết.
* **`keyword`**: Được giữ **nguyên vẹn 100%** không qua phân tích. Dùng cho tìm kiếm chính xác (**Exact Match**), bộ lọc (**Filter**), sắp xếp (**Sort**), và gom nhóm (**Aggregation**) trên các trường như: mã đơn hàng, trạng thái (`status`), danh mục (`category`), email.

### B. Query Context vs Filter Context
* **Query Context (`must`, `should`)**: Trả lời câu hỏi *"Document này khớp tốt đến mức nào?"*. Elasticsearch sẽ tính toán điểm số phù hợp (**`_score`**).
* **Filter Context (`filter`, `must_not`)**: Trả lời câu hỏi Có/Không (*"Document này có thỏa mãn điều kiện không?"*). **KHÔNG tính `_score`**, có cơ chế **Caching** cực mạnh giúp tăng tốc độ tìm kiếm.

---

## 2. Truy vấn Cơ bản

### 2.1. Lấy tất cả document (`match_all`)
```json
GET /products/_search
{
  "query": {
    "match_all": {}
  }
}
```

### 2.2. Tìm kiếm chính xác 1 giá trị (`term`)
> ⚠️ **Lưu ý**: Dùng `term` với trường kiểu `keyword`, số, boolean, date. Không dùng `term` cho trường `text`.

```json
GET /products/_search
{
  "query": {
    "term": {
      "category": "electronics"
    }
  }
}
```

### 2.3. Tìm kiếm trong danh sách giá trị (`terms`) - Tương đương `IN (...)` trong SQL
```json
GET /products/_search
{
  "query": {
    "terms": {
      "category": ["electronics", "fashion"]
    }
  }
}
```

### 2.4. Lọc theo khoảng (`range`)
Các toán tử:
- `gte`: Lớn hơn hoặc bằng ($\ge$)
- `gt`: Lớn hơn ($>$)
- `lte`: Nhỏ hơn hoặc bằng ($\le$)
- `lt`: Nhỏ hơn ($<$)

```json
GET /products/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 100,
        "lte": 500
      }
    }
  }
}
```

*Lọc theo ngày tháng:*
```json
GET /products/_search
{
  "query": {
    "range": {
      "createdAt": {
        "gte": "now-7d/d",
        "lte": "now"
      }
    }
  }
}
```

### 2.5. Kiểm tra trường có tồn tại (`exists`) - Tương đương `IS NOT NULL`
```json
GET /products/_search
{
  "query": {
    "exists": {
      "field": "description"
    }
  }
}
```

### 2.6. Tìm kiếm gần đúng / Sai chính tả (`fuzzy`)
Chấp nhận người dùng gõ sai 1-2 ký tự (sử dụng khoảng cách Levenshtein).
```json
GET /products/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "iphne",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

### 2.7. Tìm kiếm theo tiền tố (`prefix`) và ký tự đại diện (`wildcard`)
```json
# Tìm các danh mục bắt đầu bằng "elec..."
GET /products/_search
{
  "query": {
    "prefix": {
      "category": "elec"
    }
  }
}

# Wildcard (* đại diện cho nhiều ký tự, ? đại diện cho 1 ký tự)
GET /products/_search
{
  "query": {
    "wildcard": {
      "name": "*phone*"
    }
  }
}
```

---

## 3. Truy vấn Toàn văn (Full-Text Queries)

### 3.1. Truy vấn `match` chuẩn
Phân tích từ khóa tìm kiếm (tokenization, lowercasing) rồi so khớp với inverted index.
```json
GET /products/_search
{
  "query": {
    "match": {
      "name": "Apple iPhone"
    }
  }
}
```
*Tùy chỉnh toán tử `operator`:*
```json
GET /products/_search
{
  "query": {
    "match": {
      "name": {
        "query": "Apple iPhone",
        "operator": "and"  # Mặc định là "or"
      }
    }
  }
}
```

### 3.2. Khớp chính xác cả cụm từ (`match_phrase`)
Các từ phải xuất hiện **đúng thứ tự** và **liền kề nhau**.
```json
GET /products/_search
{
  "query": {
    "match_phrase": {
      "description": "titanium frame"
    }
  }
}
```
*Tham số `slop` (cho phép các từ cách nhau tối đa N từ):*
```json
GET /products/_search
{
  "query": {
    "match_phrase": {
      "description": {
        "query": "Apple chip",
        "slop": 2
      }
    }
  }
}
```

### 3.3. Tìm kiếm trên nhiều trường (`multi_match`) & Kỹ thuật Boosting (`^`)
Đây là cú pháp được dùng nhiều nhất ở các thanh tìm kiếm (Search bar):
```json
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "laptop gaming",
      "fields": [
        "name^3",        # Trọng số của trường name gấp 3 lần trường khác
        "description",
        "category^2"
      ],
      "type": "best_fields",
      "fuzziness": "AUTO"
    }
  }
}
```

---

## 4. Truy vấn Kết hợp Logic (`bool` Query)

`bool` query là "xương sống" của hầu hết các chức năng tìm kiếm sản phẩm trên E-commerce.

Cấu trúc gồm 4 mệnh đề:
- **`must`**: BẮT BUỘC khớp (tính điểm `_score`).
- **`filter`**: BẮT BUỘC khớp (KHÔNG tính điểm `_score`, được cache, siêu nhanh).
- **`should`**: NẾU KHỚP THÌ CÀNG TỐT (cộng thêm điểm `_score`, tương đương `OR`).
- **`must_not`**: BẮT BUỘC KHÔNG ĐƯỢC KHỚP.

### Ví dụ thực tế: Tìm kiếm sản phẩm E-commerce
- Tìm từ khóa "iphone" trên tên hoặc mô tả
- Phải thuộc danh mục "electronics"
- Giá từ 500 đến 1500
- Còn hàng trong kho (`stock > 0`)
- Không lấy sản phẩm có trạng thái là "ARCHIVED"
- Ưu tiên sản phẩm có chứa từ "Pro" lên đầu

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "iphone",
            "fields": ["name^3", "description"],
            "fuzziness": "AUTO"
          }
        }
      ],
      "should": [
        {
          "match": {
            "name": {
              "query": "Pro",
              "boost": 2.0
            }
          }
        }
      ],
      "filter": [
        { "term": { "category": "electronics" } },
        { "range": { "price": { "gte": 500, "lte": 1500 } } },
        { "range": { "stock": { "gt": 0 } } }
      ],
      "must_not": [
        { "term": { "status": "ARCHIVED" } }
      ]
    }
  }
}
```

---

## 5. Phân Trang, Sắp Xếp & Field Selection

### 5.1. Phân trang cơ bản (`from` & `size`)
```json
GET /products/_search
{
  "from": 0,    # Offset (bắt đầu từ vị trí nào)
  "size": 10,   # Limit (lấy bao nhiêu phần tử)
  "query": { "match_all": {} }
}
```
> ⚠️ **Lưu ý**: Tổng `from + size` không được vượt quá `10,000` (giới hạn `index.max_result_window` của ES để tránh quá tải RAM).

### 5.2. Phân trang dữ liệu lớn Deep Pagination (`search_after`)
Dùng khi người dùng cuộn vô hạn (infinite scroll) hoặc duyệt qua hàng trăm ngàn bản ghi:
```json
GET /products/_search
{
  "size": 10,
  "query": { "match_all": {} },
  "sort": [
    { "createdAt": "desc" },
    { "id": "asc" } # Bắt buộc có trường unique ở cuối để đảm bảo thứ tự
  ],
  "search_after": [ 1793813815000, 65 ] # Giá trị sort của bản ghi cuối trang trước
}
```

### 5.3. Sắp xếp (`sort`)
```json
GET /products/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "price": { "order": "asc" } },
    { "createdAt": { "order": "desc" } }
  ]
}
```

### 5.4. Chỉ lấy một số trường cần thiết (`_source`)
Giảm băng thông mạng bằng cách chỉ trả về các trường mong muốn:
```json
GET /products/_search
{
  "_source": ["id", "name", "price"],
  "query": { "match_all": {} }
}
```

---

## 6. Highlighting (Làm nổi bật từ khóa)

Tự động bọc từ khóa tìm thấy trong thẻ HTML (mặc định là `<em>...</em>`):
```json
GET /products/_search
{
  "query": {
    "match": {
      "description": "Apple flagship"
    }
  },
  "highlight": {
    "pre_tags": ["<mark class='highlight'>"],
    "post_tags": ["</mark>"],
    "fields": {
      "description": {}
    }
  }
}
```

---

## 7. Truy vấn Nâng Cao

### 7.1. Tìm kiếm trong mảng Object (`nested` query)
Nếu một document có mảng object lồng nhau (ví dụ: mảng biến thể sản phẩm `variants` gồm `color`, `size`):
```json
GET /products/_search
{
  "query": {
    "nested": {
      "path": "variants",
      "query": {
        "bool": {
          "must": [
            { "term": { "variants.color": "red" } },
            { "term": { "variants.size": "XL" } }
          ]
        }
      }
    }
  }
}
```

### 7.2. Tự điều chỉnh điểm số ranking (`function_score`)
Tăng điểm cho các sản phẩm có nhiều lượt xem, đánh giá cao, hoặc đẩy hàng tồn kho:
```json
GET /products/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "name": "shoes" } },
      "functions": [
        {
          "field_value_factor": {
            "field": "stock",
            "factor": 1.2,
            "modifier": "sqrt",
            "missing": 1
          }
        }
      ],
      "boost_mode": "multiply"
    }
  }
}
```

---

## 8. Aggregations (Thống kê / Phân tích Dữ liệu)

Tương tự `COUNT()`, `GROUP BY`, `AVG()` trong SQL, nhưng xử lý hàng triệu bản ghi trong mili-giây.

### 8.1. Thống kê số liệu (Metric Aggregation)
```json
GET /products/_search
{
  "size": 0, # Đặt size = 0 để không trả về danh sách document, chỉ lấy thống kê
  "aggs": {
    "gia_trung_binh": {
      "avg": { "field": "price" }
    },
    "gia_cao_nhat": {
      "max": { "field": "price" }
    },
    "tong_quan_gia": {
      "stats": { "field": "price" } # Trả về count, min, max, avg, sum
    }
  }
}
```

### 8.2. Gom nhóm theo danh mục (Terms Aggregation) - Tương đương `GROUP BY category`
```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "thong_ke_theo_danh_muc": {
      "terms": {
        "field": "category",
        "size": 10
      },
      "aggs": {
        "gia_tb_moi_danh_muc": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

### 8.3. Gom nhóm theo khoảng giá (Histogram Aggregation)
```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "khoang_gia": {
      "histogram": {
        "field": "price",
        "interval": 200 # Chia các bậc: 0-200, 200-400, 400-600...
      }
    }
  }
}
```

---

## 💡 Bảng So Sánh Nhanh Giữa SQL và Elasticsearch

| Thao tác SQL | Elasticsearch Query DSL tương ứng |
| :--- | :--- |
| `SELECT * FROM products` | `{"query": {"match_all": {}}}` |
| `WHERE category = 'electronics'` | `{"query": {"term": {"category": "electronics"}}}` |
| `WHERE category IN ('A', 'B')` | `{"query": {"terms": {"category": ["A", "B"]}}}` |
| `WHERE price BETWEEN 10 AND 50` | `{"query": {"range": {"price": {"gte": 10, "lte": 50}}}}` |
| `WHERE name LIKE '%phone%'` | `{"query": {"match": {"name": "phone"}}}` (Full-text) |
| `WHERE a = 1 AND b = 2` | `{"query": {"bool": {"filter": [{"term": {"a": 1}}, {"term": {"b": 2}}]}}}` |
| `WHERE a = 1 OR b = 2` | `{"query": {"bool": {"should": [{"term": {"a": 1}}, {"term": {"b": 2}}]}}}` |
| `ORDER BY price DESC` | `{"sort": [{"price": {"order": "desc"}}]}` |
| `LIMIT 10 OFFSET 20` | `{"from": 20, "size": 10}` |
| `GROUP BY category` | `{"aggs": {"by_cat": {"terms": {"field": "category"}}}}` |
