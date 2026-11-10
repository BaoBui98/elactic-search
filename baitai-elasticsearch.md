Tuyệt vời! Nếu bạn đã nắm vững các câu query cơ bản và làm chủ Kibana, thì đây là bộ 10 Bài Tập Nâng Cao Chuẩn Dự Án Thực Tế (Production-Grade E-Commerce).

Bộ bài tập này bao phủ các bài toán phức tạp mà các sàn TMĐT lớn (Shopee, Tiki, Amazon) giải quyết hàng ngày: Autocomplete (gợi ý từ khóa), Custom Analyzer tiếng Việt, Multi-facet Search, Nested Variants, Scoring & Ranking theo doanh số, Decay Function, và Geo-distance search.

Bạn hãy mở Kibana Dev Tools (http://localhost:5601 
→
→ Management 
→
→ Dev Tools) để thực hành trực tiếp từng bài nhé!

🎯 BÀI TẬP 1: Xây Dựng Search-As-You-Type (Autocomplete / Edge N-gram)
📌 Đề bài:

Khi người dùng gõ từng chữ vào thanh tìm kiếm: "iph" 
→
→ gợi ý ra "iPhone", "macb" 
→
→ gợi ý ra "MacBook". Nếu dùng wildcard "*iph*" thì tốc độ cực chậm trên dữ liệu lớn. Hãy thiết kế Edge N-gram Custom Analyzer để tìm kiếm tiền tố với tốc độ 
𝑂
(
1
)
O(1).

🛠️ Thực hành:
Tạo index products_search_v2 với Custom Filter edge_ngram_filter (min_gram: 2, max_gram: 10).
Tạo field name.autocomplete dùng analyzer này.
Test thử tính năng bằng query match.
👉 Bấm vào đây để xem lời giải (Query mẫu)
# 1. Tạo Index với Custom Analyzer
PUT /products_search_v2
{
  "settings": {
    "analysis": {
      "filter": {
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10
        }
      },
      "analyzer": {
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "edge_ngram_filter"]
        },
        "autocomplete_search": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "autocomplete_search"
          }
        }
      }
    }
  }
}

# 2. Thêm dữ liệu mẫu
POST /products_search_v2/_doc/1
{ "name": "Apple iPhone 15 Pro Max" }

POST /products_search_v2/_doc/2
{ "name": "MacBook Pro 16 M3 Max" }

# 3. Test Autocomplete: Gõ "macb"
GET /products_search_v2/_search
{
  "query": {
    "match": {
      "name.autocomplete": "macb"
    }
  }
}
🎯 BÀI TẬP 2: Tự Động Sửa Lỗi Chính Tả Với Search Suggester (Did You Mean?)
📌 Đề bài:

Khi người dùng gõ sai: "samssung glaxy", hệ thống phải tự động trả về gợi ý: "Có phải ý bạn là: samsung galaxy?".

🛠️ Yêu cầu:

Dùng Phrase Suggester với thuật toán Levenshtein distance để sinh ra từ khóa sửa lỗi đúng nhất.

👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 3: Tìm Kiếm Biến Thể Sản Phẩm (Nested Objects & Nested Aggregation)
📌 Đề bài:

Một sản phẩm có nhiều biến thể (Variants), mỗi biến thể có color, size, price.

Ví dụ: Áo Nike có 2 biến thể:
{ color: "red", size: "M", price: 150 }
{ color: "blue", size: "L", price: 180 }
Hãy viết query tìm sản phẩm: Màu đỏ VÀ Size L.
⚠️ Cạm bẫy: Nếu không dùng kiểu nested, câu query thông thường sẽ trả về chiếc áo trên (vì nó có màu đỏ và có size L, dù là 2 biến thể khác nhau!).
👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 4: Thuật Toán Xếp Hạng (Custom Scoring & Boosting Bằng Doanh Số)
📌 Đề bài:

Khi khách tìm từ khóa "smartphone", bạn muốn:

Kết quả match từ khóa như bình thường.
Sản phẩm nào có lượt bán (sales_count) cao và rating cao thì điểm liên quan (_score) được nhân lên để đẩy lên trang nhất.
Không làm biến mất các sản phẩm ít bán nhưng cực kỳ khớp từ khóa.
🛠️ Yêu cầu:

Dùng function_score với field_value_factor và hàm điều hòa log1p hoặc sqrt.

👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 5: Decay Function (Ưu Tiên Sản Phẩm Mới Ra Mắt)
📌 Đề bài:

Người dùng tìm hàng điện tử. Sản phẩm ra mắt trong vòng 7 ngày gần nhất được điểm tối đa. Càng xa mốc 7 ngày, điểm ưu tiên càng giảm dần theo hàm Gauss (Gaussian Decay Function).

👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 6: Xây Dựng Hệ Thống Bộ Lọc Đa Tầng (Faceted Navigation)
📌 Đề bài:

Tương tự trang tìm kiếm Tiki/Shopee: Khi người dùng search "laptop":

Trả về danh sách kết quả sản phẩm.
Đồng thời ở thanh menu bên trái, hiển thị:
Thống kê có bao nhiêu sản phẩm theo từng thương hiệu / category.
Khoảng giá min, max của kết quả tìm kiếm đó.
Thống kê số lượng theo các mức giá: Dưới 500$, 500$ - 1500$, Trên 1500$.
👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 7: Tìm Kiếm Theo Vị Trí Địa Lý (Geo-Distance Search)
📌 Đề bài:

Khách hàng muốn tìm các cửa hàng bán iPhone trong bán kính 5km quanh vị trí của khách (Tọa độ: Kinh độ 106.7009, Vĩ độ 10.7769 - Trung tâm Quận 1, TP.HCM), sắp xếp cửa hàng gần nhất lên trước.

👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 8: Tìm Kiếm Từ Khóa Đồng Nghĩa (Synonym Filter)
📌 Đề bài:

Trong thương mại điện tử, người dùng có nhiều cách gọi khác nhau:

Khách gõ: "đt" hoặc "dienthoai" 
→
→ phải tìm ra sản phẩm có chữ "smartphone", "iPhone", "điện thoại".
Khách gõ: "máy tính xách tay" 
→
→ phải ra "laptop".

Hãy thiết kế Synonym Token Filter để giải quyết bài toán này.

👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 9: Tìm Kiếm Ngăn Ngừa Gian Lận (Negative Boosting)
📌 Đề bài:

Khi tìm từ khóa "Apple":

Bạn muốn tìm tất cả sản phẩm của Apple (MacBook, iPhone, iPad).
Nhưng bạn KHÔNG MUỐN LOẠI BỎ HOÀN TOÀN các phụ kiện như "ốp lưng Apple" hay "dây sạc", mà chỉ muốn dìm điểm (giảm rank) của chúng xuống đáy trang kết quả để ưu tiên thiết bị chính hãng lên đầu.
🛠️ Yêu cầu:

Sử dụng boosting query với tham số negative_boost.

👉 Bấm vào đây để xem lời giải
🎯 BÀI TẬP 10: Xử Lý Phân Trang Hàng Triệu Bản Ghi (search_after)
📌 Đề bài:

Khi crawler dữ liệu hoặc export toàn bộ đơn hàng/sản phẩm ra file CSV lớn (vượt quá giới hạn 10,000 của from & size), bạn phải dùng search_after kết hợp với PIT (Point In Time) để phân trang nhất quán.

👉 Bấm vào đây để xem lời giải