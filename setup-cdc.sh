#!/bin/bash

echo "⏳ Đang chờ Kafka Connect (port 8083) sẵn sàng..."
until curl -s http://localhost:8083/connectors > /dev/null; do
    sleep 3
done
echo "✅ Kafka Connect đã sẵn sàng!"

# ==============================================================================
# Đăng ký Debezium PostgreSQL Source Connector
# Nhiệm vụ: Đọc WAL của PostgreSQL -> đẩy event vào Kafka topic: ecom.public.products
# (Việc đẩy vào Elasticsearch giờ do Logstash tự động xử lý qua file logstash.conf)
# ==============================================================================
echo ""
echo "🚀 Đang đăng ký Debezium PostgreSQL Source Connector..."
curl -s -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "postgres-debezium-source",
    "config": {
      "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
      "plugin.name": "pgoutput",
      "database.hostname": "postgres",
      "database.port": "5432",
      "database.user": "ecom_user",
      "database.password": "ecom_password",
      "database.dbname": "ecommerce",
      "topic.prefix": "ecom",
      "table.include.list": "public.products",
      "tombstones.on.delete": "false"
    }
  }' | grep -o '"name":"[^"]*"' || echo "Đã tồn tại hoặc cấu hình xong"

echo ""
echo "🎉 Hoàn tất cấu hình CDC Source Connector!"
echo "Kiểm tra trạng thái connector: curl http://localhost:8083/connectors/postgres-debezium-source/status"
