Bài thực hành 1: Tự tạo một "E-commerce Analytics Dashboard" chuyên nghiệp

Dashboard giúp bạn hiểu cách Elasticsearch tính toán thống kê (Aggregation) hàng triệu bản ghi chỉ trong tích tắc.

Vào tạo Dashboard:

Ở menu góc trái, chọn Analytics 
→
→ Dashboard.
Bấm nút Create dashboard 
→
→ chọn Create visualization.
Chọn nguồn dữ liệu là Data View products bạn vừa tạo.

Tạo 4 Panel biểu đồ:

Biểu đồ 1: Số lượng sản phẩm theo từng danh mục (Donut Chart)

Nhìn sang cột danh sách trường bên trái, kéo thả trường category vào giữa màn hình.
Ở góc phải trên chọn kiểu biểu đồ là Donut (hoặc Pie).
Bấm Save and return.

Biểu đồ 2: Top sản phẩm đắt nhất (Bar Chart)

Bấm Create visualization.
Kéo trường name vào trục X (Horizontal axis).
Kéo trường price vào trục Y (Vertical axis).
Sắp xếp theo giá giảm dần (Descending).
Bấm Save and return.

Biểu đồ 3: Tổng giá trị hàng tồn kho (Metric KPI Card)

Bấm Create visualization.
Ở mục kiểu biểu đồ chọn Metric.
Kéo trường stock vào 
→
→ chọn phép tính là Sum (Tổng số lượng tồn kho).
Bấm Save and return.

Biểu đồ 4: Phân bổ khoảng giá sản phẩm (Histogram)

Kéo trường price vào 
→
→ Kibana tự động gom nhóm thành các cột khoảng giá (ví dụ: $0 - $500, $500 - $1000,...).

👉 Sau khi xong: Bấm nút Save ở góc trên bên phải để lưu Dashboard với tên Products Overview. Bạn có thể bấm thử vào một danh mục (ví dụ electronics) trên biểu đồ tròn, toàn bộ các biểu đồ còn lại sẽ tự động lọc theo!
--------------------------------------------------------------------------------------
Bài thực hành 2: Thử nghiệm phân tích ngữ nghĩa (Analyze API) trong Dev Tools

Đây là kỹ năng cốt lõi giúp bạn hiểu tại sao tìm kiếm ra hoặc không ra kết quả.

Mở Dev Tools, dán các lệnh sau và bấm Play:

json
# Xem cách Elasticsearch bóc tách một câu tiếng Anh thành các token độc lập
POST /_analyze
{
  "analyzer": "standard",
  "text": "The Apple iPhone 15 Pro Max is Amazing!"
}

Quan sát kết quả: Bạn sẽ thấy các từ viết hoa bị đổi thành chữ thường (apple, iphone), dấu câu bị loại bỏ. Đó là lý do khi người dùng gõ apple hay APPLE đều tìm ra Apple.

json
# Thử so sánh xem trường 'name' (text) và 'category' (keyword) lưu trữ khác nhau thế nào:
POST /products/_analyze
{
  "field": "name",
  "text": "iPhone 15 Pro"
}
POST /products/_analyze
{
  "field": "category",
  "text": "electronics"
}
Bài thực hành 3: Kiểm tra tốc độ & Đo hiệu năng query (Search Profiler)

Khi làm hệ thống lớn, bạn sẽ cần biết câu query tìm kiếm của mình tốn bao nhiêu mili-giây và chậm ở đâu.

Vào Menu 
→
→ Management 
→
→ Dev Tools.
Nhìn lên thanh tab trên đầu (cạnh chữ Console), click sang tab Search Profiler.
Dán câu query bool tìm kiếm sản phẩm:
json
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
      "filter": [
        { "term": { "category": "electronics" } }
      ]
    }
  }
}
Bấm Profile.
Bạn sẽ thấy cây phân tích chi tiết:
Shard nào xử lý mất bao nhiêu ms.
Phần multi_match tốn bao nhiêu thời gian.
Phần filter được cache như thế nào.


Bài thực hành 4: Thử nghiệm CDC realtime ngay trên Kibana

Hãy mở song song 2 cửa sổ:

Một bên mở Discover trên Kibana (bật chế độ Auto refresh ở góc trên bên phải: 5 giây một lần).
Một bên mở terminal gửi lệnh tạo sản phẩm mới vào NestJS API:
bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kibana Test Product Realtime",
    "description": "Sản phẩm kiểm tra CDC",
    "price": 999,
    "stock": 10,
    "category": "electronics"
  }'
Nhìn sang màn hình Kibana: Sau khoảng 1-2 giây, bạn sẽ thấy sản phẩm mới này tự động nổi lên đầu bảng Discover mà không cần reload trang!

Bạn hãy thử bắt tay vào làm Bài 1 (Tạo Dashboard) trước nhé, giao diện trực quan kéo thả của Kibana Lens rất mượt và trực quan!


--------------------------------------------------------------------------------------
Trong giao diện Kibana Lens (màn hình bạn đang mở):

Kibana Lens là công cụ vẽ biểu đồ, tổng hợp (Aggregation, Group by).
Theo thiết kế của Elasticsearch, trường kiểu text (như trường name và description của chúng ta) mặc định KHÔNG cho phép dùng để gom nhóm / vẽ biểu đồ (Fielddata is disabled on text fields).
Vì trường name là text thuần túy và không có sub-field keyword, nên Kibana Lens tự động ẩn nó đi khỏi danh sách các trường có thể vẽ biểu đồ (chỉ hiện các trường keyword, number, date).
Cách khắc phục chuẩn: Thêm sub-field keyword cho name

Trong Elasticsearch chuẩn, một trường text luôn đi kèm một sub-field keyword dạng:

name: Dùng để tìm kiếm full-text (Search bar).
name.keyword: Dùng để vẽ biểu đồ, gom nhóm, sắp xếp (Kibana Lens, Group By).
Bước 1: Mở Dev Tools trong Kibana

Vào Menu góc trái 
→
→ Management 
→
→ Dev Tools.

Dán đoạn lệnh này vào và bấm nút Play:

json
PUT /products/_mapping
{
  "properties": {
    "name": {
      "type": "text",
      "analyzer": "standard",
      "fields": {
        "keyword": {
          "type": "keyword",
          "ignore_above": 256
        }
      }
    },
    "description": {
      "type": "text",
      "analyzer": "standard",
      "fields": {
        "keyword": {
          "type": "keyword",
          "ignore_above": 256
        }
      }
    }
  }
}

(Lệnh này thêm thuộc tính .keyword cho name và description mà không làm mất dữ liệu hiện có).

Bước 2: Cập nhật lại dữ liệu hiện có (Update by query)

Chạy tiếp lệnh này trong Dev Tools để Elasticsearch sinh keyword cho 60 sản phẩm cũ:

json
POST /products/_update_by_query?conflicts=proceed
Bước 3: Reload lại Field List trên Data View của Kibana
Vào Menu 
→
→ Management 
→
→ Stack Management (dưới cùng).
Chọn Data Views (ở cột trái) 
→
→ Click vào data view products.
Ở góc trên bên phải, bấm vào nút Reload field list (biểu tượng 2 mũi tên xoay tròn).