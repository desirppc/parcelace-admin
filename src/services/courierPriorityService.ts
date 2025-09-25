import { apiRequest } from '@/config/api';
import { 
  CourierPriorityResponse, 
  CourierPriorityData,
  CourierPriorityFormData,
  LocalPriorityConfig,
  LocalCourierPriority,
  PriorityUpdateRequest
} from '@/types/courierPriority';

export class CourierPriorityService {
  /**
   * Get courier priority settings from API
   */
  static async getCourierPrioritySettings(): Promise<CourierPriorityData> {
    try {
      const response = await apiRequest('api/courier-priority', 'GET');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch courier priority settings');
      }
    } catch (error) {
      console.error('Error fetching courier priority settings:', error);
      throw error;
    }
  }

  /**
   * Update courier priority settings
   */
  static async updateCourierPrioritySettings(priorities: LocalPriorityConfig): Promise<boolean> {
    try {
      // Transform local format to API format
      const apiFormat: PriorityUpdateRequest = {
        priority: Object.keys(priorities).map(orderType => {
          // Sort priorities by priority_id and extract courier_partner_ids as strings
          const sortedPriorities = priorities[orderType]
            .sort((a, b) => a.priority_id - b.priority_id)
            .map(p => p.courier_partner_id.toString());
          
          return {
            order_type: orderType,
            courier_partner_id: sortedPriorities
          };
        })
      };

      console.log('Sending API request with format:', apiFormat);

      const response = await apiRequest('api/courier-priority', 'POST', apiFormat);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.error || 'Failed to update courier priority settings');
      }
    } catch (error) {
      console.error('Error updating courier priority settings:', error);
      throw error;
    }
  }

  /**
   * Transform API data to local component format
   */
  static transformApiDataToLocal(data: CourierPriorityData): CourierPriorityFormData {
    const priorities: LocalPriorityConfig = {};
    
    // Transform courier priorities to local format
    Object.keys(data.courier_priorities).forEach(orderType => {
      priorities[orderType] = data.courier_priorities[orderType].map(priority => {
        const courierPartner = data.courier_partners.find(cp => cp.value === priority.courier_partner_id);
        return {
          courier_partner_id: priority.courier_partner_id,
          priority_id: priority.priority_id,
          courier_name: courierPartner?.label || 'Unknown'
        };
      });
    });

    return {
      order_types: data.order_types,
      courier_partners: data.courier_partners,
      priorities
    };
  }

  /**
   * Validate priority configuration
   */
  static validatePriorities(priorities: LocalPriorityConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    Object.keys(priorities).forEach(orderType => {
      const orderPriorities = priorities[orderType];
      const usedCourierIds = new Set<number>();
      
      orderPriorities.forEach(priority => {
        if (usedCourierIds.has(priority.courier_partner_id)) {
          errors.push(`${orderType}: Duplicate courier partner found`);
        }
        usedCourierIds.add(priority.courier_partner_id);
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
