import apiClient from './apiClient';

export async function invoke(name, payload = {}) {
  return apiClient.post(`/functions/${name}`, payload);
}

export const functions = { invoke };

export const Core = {
  async UploadFile({ file }) {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async SendEmail(payload) {
    return invoke('sendSystemEmail', payload);
  },

  async InvokeLLM(payload) {
    return invoke('invokeLLM', payload);
  }
};

export const UploadFile = Core.UploadFile;
export const SendEmail = Core.SendEmail;
export const InvokeLLM = Core.InvokeLLM;

export default functions;
