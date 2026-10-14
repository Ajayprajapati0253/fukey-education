import { INITIAL_STUDY_MATERIALS } from '../data/initialData';
import type { MaterialFormData, MaterialStatus, MaterialType, StudyMaterialItem } from '../types';

const STORAGE_KEY = 'edu_admin_study_materials_v4';

class StudyMaterialsApi {
  private getStorage(): StudyMaterialItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse study materials from storage', e);
    }
    // Seed initial data
    this.saveStorage(INITIAL_STUDY_MATERIALS);
    return INITIAL_STUDY_MATERIALS;
  }

  private saveStorage(items: StudyMaterialItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save study materials to storage', e);
    }
  }

  public getAll(): StudyMaterialItem[] {
    return this.getStorage();
  }

  public getByType(type: MaterialType | 'all'): StudyMaterialItem[] {
    const items = this.getStorage();
    if (type === 'all' || type === 'overview') {
      return items;
    }
    return items.filter((item) => item.type === type);
  }

  public getById(id: string): StudyMaterialItem | undefined {
    return this.getStorage().find((item) => item.id === id);
  }

  public create(formData: MaterialFormData): StudyMaterialItem {
    const items = this.getStorage();
    const now = new Date().toISOString().split('T')[0];
    
    // determine highest order
    const maxOrder = items.reduce((max, it) => Math.max(max, it.order || 0), 0);

    const newItem: StudyMaterialItem = {
      ...formData,
      id: `mat-${formData.type.slice(0, 4)}-${Date.now().toString(36)}`,
      downloadCount: 0,
      viewCount: 0,
      order: formData.order ?? maxOrder + 1,
      createdAt: now,
      updatedAt: now,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [formData.subject, formData.grade],
    };

    items.unshift(newItem);
    this.saveStorage(items);
    return newItem;
  }

  public update(id: string, updates: Partial<StudyMaterialItem>): StudyMaterialItem {
    const items = this.getStorage();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    const updatedItem: StudyMaterialItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    items[index] = updatedItem;
    this.saveStorage(items);
    return updatedItem;
  }

  public delete(id: string): void {
    const items = this.getStorage();
    const filtered = items.filter((item) => item.id !== id);
    this.saveStorage(filtered);
  }

  public bulkDelete(ids: string[]): void {
    const idSet = new Set(ids);
    const items = this.getStorage().filter((item) => !idSet.has(item.id));
    this.saveStorage(items);
  }

  public setStatus(id: string, status: MaterialStatus): StudyMaterialItem {
    return this.update(id, { status });
  }

  public bulkSetStatus(ids: string[], status: MaterialStatus): void {
    const idSet = new Set(ids);
    const now = new Date().toISOString().split('T')[0];
    const items = this.getStorage().map((item) => {
      if (idSet.has(item.id)) {
        return { ...item, status, updatedAt: now };
      }
      return item;
    });
    this.saveStorage(items);
  }

  public replaceFile(id: string, fileName: string, fileSize: string, fileFormat: 'pdf' | 'docx' | 'zip' | 'quiz' | 'json'): StudyMaterialItem {
    return this.update(id, {
      fileName,
      fileSize,
      fileFormat,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  }

  public reorder(reorderedIds: string[]): void {
    const items = this.getStorage();
    const itemMap = new Map(items.map((i) => [i.id, i]));
    
    // Assign new orders based on position in reorderedIds
    reorderedIds.forEach((id, idx) => {
      const item = itemMap.get(id);
      if (item) {
        item.order = idx + 1;
      }
    });

    this.saveStorage(Array.from(itemMap.values()));
  }

  public resetToDefault(): void {
    this.saveStorage(INITIAL_STUDY_MATERIALS);
  }
}

export const studyMaterialsApi = new StudyMaterialsApi();
