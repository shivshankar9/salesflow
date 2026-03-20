import requests
import sys
import json
from datetime import datetime, date

class CRMAPITester:
    def __init__(self, base_url="https://java-contacts.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = {
            'contacts': [],
            'leads': [],
            'deals': [],
            'activities': []
        }

    def log_result(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"    Details: {details}")
        if success:
            self.tests_passed += 1
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            response_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
            
            return success, response_data, response.status_code
        except requests.exceptions.RequestException as e:
            print(f"    Request error: {str(e)}")
            return False, {}, 0
        except json.JSONDecodeError:
            print(f"    Invalid JSON response")
            return False, {}, response.status_code

    # Authentication Tests
    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test_{timestamp}@testdomain.com",
            "password": "TestPassword123!",
            "role": "sales_rep"
        }
        
        success, data, status = self.make_request('POST', '/auth/register', test_user, 200)
        
        if success and 'token' in data and 'user' in data:
            self.token = data['token']
            self.user_id = data['user']['id']
            self.test_user_email = test_user['email']
            return self.log_result("User Registration", True, f"User ID: {self.user_id}")
        else:
            return self.log_result("User Registration", False, f"Status: {status}, Data: {data}")

    def test_user_login(self):
        """Test user login with created account"""
        if not hasattr(self, 'test_user_email'):
            return self.log_result("User Login", False, "No test user created")
            
        login_data = {
            "email": self.test_user_email,
            "password": "TestPassword123!"
        }
        
        success, data, status = self.make_request('POST', '/auth/login', login_data, 200)
        
        if success and 'token' in data:
            self.token = data['token']  # Update token
            return self.log_result("User Login", True, "Login successful")
        else:
            return self.log_result("User Login", False, f"Status: {status}")

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            return self.log_result("Get Current User", False, "No auth token")
            
        success, data, status = self.make_request('GET', '/auth/me', None, 200)
        
        if success and 'id' in data and 'email' in data:
            return self.log_result("Get Current User", True, f"Email: {data.get('email')}")
        else:
            return self.log_result("Get Current User", False, f"Status: {status}")

    # Contact Tests
    def test_create_contact(self):
        """Test creating a contact"""
        if not self.token:
            return self.log_result("Create Contact", False, "No auth token")
            
        contact_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1-555-123-4567",
            "company": "Test Company",
            "position": "Manager",
            "status": "active"
        }
        
        success, data, status = self.make_request('POST', '/contacts', contact_data, 200)
        
        if success and 'id' in data:
            self.created_items['contacts'].append(data['id'])
            return self.log_result("Create Contact", True, f"Contact ID: {data['id']}")
        else:
            return self.log_result("Create Contact", False, f"Status: {status}")

    def test_get_contacts(self):
        """Test retrieving all contacts"""
        if not self.token:
            return self.log_result("Get Contacts", False, "No auth token")
            
        success, data, status = self.make_request('GET', '/contacts', None, 200)
        
        if success and isinstance(data, list):
            return self.log_result("Get Contacts", True, f"Found {len(data)} contacts")
        else:
            return self.log_result("Get Contacts", False, f"Status: {status}")

    def test_update_contact(self):
        """Test updating a contact"""
        if not self.token or not self.created_items['contacts']:
            return self.log_result("Update Contact", False, "No contact to update")
            
        contact_id = self.created_items['contacts'][0]
        update_data = {
            "name": "John Doe Updated",
            "email": "john.updated@example.com",
            "phone": "+1-555-999-8888",
            "company": "Updated Company",
            "position": "Senior Manager",
            "status": "active"
        }
        
        success, data, status = self.make_request('PUT', f'/contacts/{contact_id}', update_data, 200)
        
        if success and data.get('name') == "John Doe Updated":
            return self.log_result("Update Contact", True, "Contact updated successfully")
        else:
            return self.log_result("Update Contact", False, f"Status: {status}")

    def test_delete_contact(self):
        """Test deleting a contact"""
        if not self.token or not self.created_items['contacts']:
            return self.log_result("Delete Contact", False, "No contact to delete")
            
        contact_id = self.created_items['contacts'][0]
        success, data, status = self.make_request('DELETE', f'/contacts/{contact_id}', None, 200)
        
        if success:
            self.created_items['contacts'].remove(contact_id)
            return self.log_result("Delete Contact", True, "Contact deleted successfully")
        else:
            return self.log_result("Delete Contact", False, f"Status: {status}")

    # Lead Tests
    def test_create_lead(self):
        """Test creating a lead"""
        if not self.token:
            return self.log_result("Create Lead", False, "No auth token")
            
        lead_data = {
            "name": "Jane Smith",
            "email": "jane.smith@prospect.com",
            "phone": "+1-555-987-6543",
            "company": "Prospect Corp",
            "value": 5000.0,
            "stage": "new",
            "source": "website"
        }
        
        success, data, status = self.make_request('POST', '/leads', lead_data, 200)
        
        if success and 'id' in data:
            self.created_items['leads'].append(data['id'])
            return self.log_result("Create Lead", True, f"Lead ID: {data['id']}")
        else:
            return self.log_result("Create Lead", False, f"Status: {status}")

    def test_get_leads(self):
        """Test retrieving all leads"""
        if not self.token:
            return self.log_result("Get Leads", False, "No auth token")
            
        success, data, status = self.make_request('GET', '/leads', None, 200)
        
        if success and isinstance(data, list):
            return self.log_result("Get Leads", True, f"Found {len(data)} leads")
        else:
            return self.log_result("Get Leads", False, f"Status: {status}")

    def test_update_lead(self):
        """Test updating a lead"""
        if not self.token or not self.created_items['leads']:
            return self.log_result("Update Lead", False, "No lead to update")
            
        lead_id = self.created_items['leads'][0]
        update_data = {
            "name": "Jane Smith Updated",
            "email": "jane.updated@prospect.com",
            "company": "Updated Prospect Corp",
            "value": 7500.0,
            "stage": "qualified",
            "source": "referral"
        }
        
        success, data, status = self.make_request('PUT', f'/leads/{lead_id}', update_data, 200)
        
        if success and data.get('stage') == "qualified":
            return self.log_result("Update Lead", True, "Lead updated successfully")
        else:
            return self.log_result("Update Lead", False, f"Status: {status}")

    # Deal Tests
    def test_create_deal(self):
        """Test creating a deal"""
        if not self.token:
            return self.log_result("Create Deal", False, "No auth token")
            
        deal_data = {
            "name": "Big Software Deal",
            "value": 25000.0,
            "stage": "qualification",
            "probability": 75,
            "expected_close_date": "2024-12-31"
        }
        
        success, data, status = self.make_request('POST', '/deals', deal_data, 200)
        
        if success and 'id' in data:
            self.created_items['deals'].append(data['id'])
            return self.log_result("Create Deal", True, f"Deal ID: {data['id']}")
        else:
            return self.log_result("Create Deal", False, f"Status: {status}")

    def test_get_deals(self):
        """Test retrieving all deals"""
        if not self.token:
            return self.log_result("Get Deals", False, "No auth token")
            
        success, data, status = self.make_request('GET', '/deals', None, 200)
        
        if success and isinstance(data, list):
            return self.log_result("Get Deals", True, f"Found {len(data)} deals")
        else:
            return self.log_result("Get Deals", False, f"Status: {status}")

    # Activity Tests
    def test_create_activity(self):
        """Test creating an activity"""
        if not self.token:
            return self.log_result("Create Activity", False, "No auth token")
            
        activity_data = {
            "title": "Follow up call",
            "description": "Call prospect about the deal proposal",
            "activity_type": "call",
            "due_date": "2024-08-15",
            "completed": False
        }
        
        success, data, status = self.make_request('POST', '/activities', activity_data, 200)
        
        if success and 'id' in data:
            self.created_items['activities'].append(data['id'])
            return self.log_result("Create Activity", True, f"Activity ID: {data['id']}")
        else:
            return self.log_result("Create Activity", False, f"Status: {status}")

    def test_get_activities(self):
        """Test retrieving all activities"""
        if not self.token:
            return self.log_result("Get Activities", False, "No auth token")
            
        success, data, status = self.make_request('GET', '/activities', None, 200)
        
        if success and isinstance(data, list):
            return self.log_result("Get Activities", True, f"Found {len(data)} activities")
        else:
            return self.log_result("Get Activities", False, f"Status: {status}")

    def test_dashboard_metrics(self):
        """Test dashboard metrics endpoint"""
        if not self.token:
            return self.log_result("Dashboard Metrics", False, "No auth token")
            
        success, data, status = self.make_request('GET', '/dashboard/metrics', None, 200)
        
        expected_keys = ['total_contacts', 'total_leads', 'total_deals', 'total_value', 'leads_by_stage']
        
        if success and all(key in data for key in expected_keys):
            return self.log_result("Dashboard Metrics", True, 
                                 f"Contacts: {data.get('total_contacts')}, Leads: {data.get('total_leads')}, Deals: {data.get('total_deals')}")
        else:
            return self.log_result("Dashboard Metrics", False, f"Status: {status}, Missing keys: {[k for k in expected_keys if k not in data]}")

    def cleanup_test_data(self):
        """Clean up created test data"""
        print(f"\n🧹 Cleaning up test data...")
        
        # Delete activities
        for activity_id in self.created_items['activities']:
            self.make_request('DELETE', f'/activities/{activity_id}', None, 200)
            
        # Delete deals 
        for deal_id in self.created_items['deals']:
            self.make_request('DELETE', f'/deals/{deal_id}', None, 200)
            
        # Delete leads
        for lead_id in self.created_items['leads']:
            self.make_request('DELETE', f'/leads/{lead_id}', None, 200)
            
        # Delete contacts
        for contact_id in self.created_items['contacts']:
            self.make_request('DELETE', f'/contacts/{contact_id}', None, 200)
            
        print("✅ Cleanup completed")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CRM API Tests")
        print(f"🔗 Base URL: {self.base_url}")
        print("=" * 50)

        # Authentication Tests
        print("\n📝 Authentication Tests")
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()

        # Contact Tests
        print("\n👥 Contact Tests")
        self.test_create_contact()
        self.test_get_contacts()
        self.test_update_contact()
        self.test_delete_contact()

        # Lead Tests  
        print("\n🎯 Lead Tests")
        self.test_create_lead()
        self.test_get_leads()
        self.test_update_lead()

        # Deal Tests
        print("\n💰 Deal Tests")
        self.test_create_deal()
        self.test_get_deals()

        # Activity Tests
        print("\n📋 Activity Tests")
        self.test_create_activity()
        self.test_get_activities()

        # Dashboard Tests
        print("\n📊 Dashboard Tests")
        self.test_dashboard_metrics()

        # Cleanup
        self.cleanup_test_data()

        # Final Results
        print("\n" + "=" * 50)
        print(f"📊 Final Results: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = CRMAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())