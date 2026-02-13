-- RPC: Get total sales grouped by date
-- Usage: select * from get_sales_by_date('2025-01-01', '2025-12-31');
CREATE OR REPLACE FUNCTION get_sales_by_date(start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL, end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS TABLE (date TEXT, total NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
    SUM(amount_total) as total -- Assuming 'amount_total' exists in 'orders' table (from Stripe Checkout session usually stored, or sum of items)
  FROM orders
  WHERE 
    (start_date IS NULL OR created_at >= start_date) AND
    (end_date IS NULL OR created_at <= end_date)
  GROUP BY 1
  ORDER BY 1;
END;
$$;

-- RPC: Get sales count grouped by category
-- Usage: select * from get_sales_by_category();
-- Note: 'order_items' must link to 'products' to get the category.
CREATE OR REPLACE FUNCTION get_sales_by_category()
RETURNS TABLE (category TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.category,
    COUNT(*) as count
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  GROUP BY 1
  ORDER BY 2 DESC;
END;
$$;
