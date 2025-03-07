import { supabase } from './supabase';

const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;

export async function uploadImage(file: File, userId: string) {
  const filename = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filename, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filename);

  return publicUrl;
}

export async function removeBackground(imageUrl: string) {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('Please add your Replicate API token to the .env file (VITE_REPLICATE_API_TOKEN)');
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      input: {
        image: imageUrl,
      },
    }),
  });

  const prediction = await response.json();
  if (prediction.error) {
    throw new Error(prediction.error);
  }
  return prediction.output;
}

export async function smartInpaint(imageUrl: string, mask: string) {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('Please add your Replicate API token to the .env file (VITE_REPLICATE_API_TOKEN)');
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "c11bac58203367db93a3c552bd49a38b9443c6ae7e650f81cd27a8b5748174ad",
      input: {
        image: imageUrl,
        mask: mask,
        prompt: "Restore this image naturally",
      },
    }),
  });

  const prediction = await response.json();
  if (prediction.error) {
    throw new Error(prediction.error);
  }
  return prediction.output;
}