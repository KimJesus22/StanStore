-- Function to atomically decrement stock
-- Returns the new stock level if successful, or raises an error if insufficient stock

CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity_to_decrement INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
  product_name TEXT;
BEGIN
  -- Select current stock and name, locking the row for update to prevent race conditions
  SELECT stock, name INTO current_stock, product_name
  FROM products
  WHERE id = product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF current_stock < quantity_to_decrement THEN
    RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %', product_name, quantity_to_decrement, current_stock;
  END IF;

  new_stock := current_stock - quantity_to_decrement;

  UPDATE products
  SET stock = new_stock
  WHERE id = product_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_stock', new_stock,
    'product_id', product_id
  );
END;
$$;
