create unique index if not exists brands_name_key_idx on brands (name);
create unique index if not exists tool_categories_name_key_idx on tool_categories (name);
create unique index if not exists product_images_product_id_image_url_key_idx on product_images (product_id, image_url);
