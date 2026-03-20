from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
]

BUSINESS_TYPES = [
    'Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited',
    'OPC', 'Section 8 Company', 'Trust', 'Society', 'HUF'
]

class IndianAddress(BaseModel):
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str = 'India'

class GSTDetails(BaseModel):
    gstin: Optional[str] = None
    pan: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None

class InvoiceItem(BaseModel):
    description: str
    quantity: float
    rate: float
    amount: float
    cgst_rate: float = 9.0
    sgst_rate: float = 9.0
    igst_rate: float = 0.0

class Invoice(BaseModel):
    invoice_number: str
    invoice_date: str
    customer_name: str
    customer_gstin: Optional[str] = None
    customer_address: str
    items: list[InvoiceItem]
    subtotal: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    total_amount: float
    notes: Optional[str] = None

def generate_invoice_number():
    now = datetime.now()
    return f"INV-{now.strftime('%Y%m')}-{str(uuid.uuid4())[:8].upper()}"

def calculate_gst(amount: float, gst_rate: float = 18.0, is_interstate: bool = False):
    if is_interstate:
        igst = amount * (gst_rate / 100)
        return {'cgst': 0, 'sgst': 0, 'igst': igst, 'total': amount + igst}
    else:
        half_rate = gst_rate / 2
        cgst = amount * (half_rate / 100)
        sgst = amount * (half_rate / 100)
        return {'cgst': cgst, 'sgst': sgst, 'igst': 0, 'total': amount + cgst + sgst}

def validate_gstin(gstin: str) -> bool:
    if not gstin or len(gstin) != 15:
        return False
    pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    import re
    return bool(re.match(pattern, gstin))

def validate_pan(pan: str) -> bool:
    if not pan or len(pan) != 10:
        return False
    pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    import re
    return bool(re.match(pattern, pan))