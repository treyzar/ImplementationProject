import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  DocumentTemplateDTO,
  DocumentTemplateListDTO,
  DocumentTemplateCreatePayload,
  DocumentTemplateUpdatePayload,
  SourceFileDTO,
  SourceFileListDTO,
} from '../components/document-builder/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/documents';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

function handleApiError(error: AxiosError): never {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as Record<string, unknown>;
    
    if (status === 401) {
      throw new Error('Необходима авторизация');
    } else if (status === 403) {
      throw new Error('Доступ запрещён');
    } else if (status === 404) {
      throw new Error('Ресурс не найден');
    } else if (status === 400) {
      const message = typeof data === 'object' 
        ? Object.values(data).flat().join(', ')
        : 'Неверные данные запроса';
      throw new Error(message);
    } else {
      throw new Error(`Ошибка сервера: ${status}`);
    }
  } else if (error.request) {
    throw new Error('Сервер не отвечает');
  } else {
    throw new Error('Ошибка при выполнении запроса');
  }
}

export async function getTemplates(): Promise<DocumentTemplateListDTO[]> {
  try {
    const response = await apiClient.get<DocumentTemplateListDTO[]>('/templates/');
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function getTemplate(id: number): Promise<DocumentTemplateDTO> {
  try {
    const response = await apiClient.get<DocumentTemplateDTO>(`/templates/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function createTemplate(payload: DocumentTemplateCreatePayload): Promise<DocumentTemplateDTO> {
  try {
    const response = await apiClient.post<DocumentTemplateDTO>('/templates/', payload);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function updateTemplate(
  id: number,
  payload: DocumentTemplateUpdatePayload
): Promise<DocumentTemplateDTO> {
  try {
    const response = await apiClient.patch<DocumentTemplateDTO>(`/templates/${id}/`, payload);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function deleteTemplate(id: number): Promise<void> {
  try {
    await apiClient.delete(`/templates/${id}/`);
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function getSourceFiles(): Promise<SourceFileListDTO[]> {
  try {
    const response = await apiClient.get<SourceFileListDTO[]>('/source-files/');
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function getSourceFile(id: number): Promise<SourceFileDTO> {
  try {
    const response = await apiClient.get<SourceFileDTO>(`/source-files/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function uploadSourceFile(
  file: File,
  templateId?: number
): Promise<SourceFileDTO> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (templateId !== undefined && templateId !== null) {
      formData.append('template_id', templateId.toString());
    }
    
    const response = await apiClient.post<SourceFileDTO>('/upload-source-file/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export async function deleteSourceFile(id: number): Promise<void> {
  try {
    await apiClient.delete(`/source-files/${id}/`);
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

export const documentBuilderApi = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getSourceFiles,
  getSourceFile,
  uploadSourceFile,
  deleteSourceFile,
};

export default documentBuilderApi;
