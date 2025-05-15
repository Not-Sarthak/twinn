"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Get authentication headers using the user's DID token
 */
const getAuthHeaders = () => {
  const userDID = typeof window !== 'undefined' ? localStorage.getItem("userDID") : null;
  return {
    headers: {
      "Content-Type": "application/json",
      ...(userDID ? { Authorization: `Bearer ${userDID}` } : {}),
    }
  };
};

/**
 * Get all collections with optional filtering
 */
export async function getCollections(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const response = await axios.get(`${API_URL}/collections?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching collections:", error);
    // Return a default structure with empty collections array to prevent UI errors
    return {
      collections: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
  }
}

/**
 * Get a collection by ID
 */
export async function getCollectionById(id: string) {
  try {
    const response = await axios.get(`${API_URL}/collections/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error);
    // Return a default structure with empty collection to prevent UI errors
    return {
      collection: null,
      drops: []
    };
  }
}

/**
 * Create a new collection
 */
export async function createCollection(collectionData: any) {
  try {
    // Format the data to match backend expectations
    const formattedData = {
      name: collectionData.title || collectionData.name,
      title: collectionData.title,
      description: collectionData.description,
      logo: collectionData.ipfs?.logo?.gateway_url || collectionData.logo,
      coverImage: collectionData.ipfs?.cover?.gateway_url || collectionData.coverImage,
      link: collectionData.link,
      type: collectionData.type,
      isVerified: false
    };

    const response = await axios.post(`${API_URL}/collections`, formattedData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

/**
 * Update a collection
 */
export async function updateCollection(id: string, collectionData: any) {
  try {
    const response = await axios.put(`${API_URL}/collections/${id}`, collectionData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error updating collection ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: string) {
  try {
    const response = await axios.delete(`${API_URL}/collections/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error deleting collection ${id}:`, error);
    throw error;
  }
} 