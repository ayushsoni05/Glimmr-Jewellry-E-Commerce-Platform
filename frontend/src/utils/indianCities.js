/**
 * Comprehensive list of major cities, towns, and districts in India
 * Organized by state for easy searching
 */

export const INDIAN_CITIES = [
  // Andhra Pradesh
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 
  'Kadapa', 'Tirupati', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam',
  'Adoni', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal',
  'Dharmavaram', 'Gudivada', 'Srikakulam', 'Narasaraopet', 'Tadpatri', 'Tadepalligudem',
  
  // Arunachal Pradesh
  'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Changlang',
  
  // Assam
  'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon',
  'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Sivasagar', 'Goalpara', 'Barpeta',
  'Lanka', 'Lumding', 'Haflong', 'Hojai', 'Mangaldoi', 'Nalbari', 'Rangia',
  
  // Bihar
  'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Munger', 'Chapra',
  'Arrah', 'Begusarai', 'Katihar', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan',
  'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur', 'Jehanabad',
  'Aurangabad', 'Madhubani', 'Bettiah', 'Samastipur', 'Araria', 'Gopalganj', 'Madhepura',
  
  // Chhattisgarh
  'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh',
  'Ambikapur', 'Mahasamund', 'Dhamtari', 'Chirmiri', 'Bhatapara', 'Dalli-Rajhara', 'Naila Janjgir',
  
  // Goa
  'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim',
  
  // Gujarat
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar',
  'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar',
  'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Veraval', 'Godhra', 'Patan', 'Kalol', 'Dahod', 'Botad',
  'Amreli', 'Deesa', 'Jetpur', 'Gandhidham', 'Ankleshwar', 'Modasa', 'Himmatnagar', 'Keshod',
  
  // Haryana
  'Faridabad', 'Gurgaon', 'Gurugram', 'Hisar', 'Rohtak', 'Panipat', 'Karnal', 'Sonipat', 'Yamunanagar',
  'Panchkula', 'Bhiwani', 'Bahadurgarh', 'Jind', 'Sirsa', 'Thanesar', 'Kaithal', 'Palwal', 'Rewari',
  'Hansi', 'Narnaul', 'Fatehabad', 'Gohana', 'Tohana', 'Narwana', 'Mandi Dabwali', 'Charkhi Dadri',
  
  // Himachal Pradesh
  'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Kullu', 'Hamirpur',
  'Una', 'Bilaspur', 'Chamba', 'Kangra', 'Sundarnagar', 'Manali', 'Parwanoo', 'Nalagarh',
  
  // Jharkhand
  'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih',
  'Ramgarh', 'Medininagar', 'Chirkunda', 'Jhumri Tilaiya', 'Saunda', 'Sahibganj', 'Madhupur',
  'Chaibasa', 'Chatra', 'Gumla', 'Dumka', 'Godda', 'Lohardaga', 'Mihijam', 'Khunti',
  
  // Karnataka
  'Bangalore', 'Bengaluru', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere',
  'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Gadag', 'Hassan',
  'Mandya', 'Udupi', 'Kolar', 'Chikmagalur', 'Karwar', 'Ranebennuru', 'Gangavathi', 'Chitradurga',
  'Robertson Pet', 'Bhadravati', 'Robertsonpet', 'Bagalkot', 'Sirsi', 'Puttur', 'Madhugiri',
  
  // Kerala
  'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Calicut', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha',
  'Malappuram', 'Kannur', 'Kottayam', 'Kasaragod', 'Manjeri', 'Taliparamba', 'Koyilandy', 'Neyyattinkara',
  'Kayamkulam', 'Nedumangad', 'Kannur Cantonment', 'Kanhangad', 'Payyanur', 'Kottakkal', 'Kovalam',
  'Perinthalmanna', 'Tirur', 'Kottarakara', 'Paravur', 'Pathanamthitta', 'Chalakudy', 'Nilambur',
  
  // Madhya Pradesh
  'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam',
  'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri',
  'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Hoshangabad',
  'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Datia', 'Nagda', 'Dhar', 'Tikamgarh',
  
  // Maharashtra
  'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Solapur',
  'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon',
  'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji',
  'Jalna', 'Ambarnath', 'Bhusawal', 'Panvel', 'Badlapur', 'Beed', 'Gondia', 'Satara', 'Barshi',
  'Yavatmal', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Wardha', 'Udgir', 'Hinganghat',
  
  // Manipur
  'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati', 'Tamenglong',
  
  // Meghalaya
  'Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara', 'Williamnagar', 'Nongpoh', 'Mairang',
  
  // Mizoram
  'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Lawngtlai', 'Mamit',
  
  // Nagaland
  'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon',
  
  // Odisha
  'Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak',
  'Baripada', 'Jharsuguda', 'Jeypore', 'Bargarh', 'Balangir', 'Rayagada', 'Bhawanipatna', 'Dhenkanal',
  'Barbil', 'Kendujhar', 'Sunabeda', 'Jatani', 'Byasanagar', 'Paradip', 'Talcher', 'Kendrapara',
  
  // Punjab
  'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Batala',
  'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura',
  'Firozpur', 'Kapurthala', 'Faridkot', 'Sunam', 'Mansa', 'Sangrur', 'Nabha', 'Tarn Taran',
  
  // Rajasthan
  'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur',
  'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Tonk', 'Beawar', 'Hanumangarh', 'Didwana',
  'Barmer', 'Jhunjhunu', 'Churu', 'Nagaur', 'Chittorgarh', 'Jaisalmer', 'Bhiwadi', 'Sawai Madhopur',
  'Bundi', 'Baran', 'Jhalawar', 'Dungarpur', 'Banswara', 'Pratapgarh', 'Rajsamand', 'Dausa',
  'Karauli', 'Dholpur', 'Makrana', 'Sujangarh', 'Ladnun', 'Sardarshahar', 'Nokha', 'Phalodi',
  
  // Sikkim
  'Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Rangpo', 'Jorethang', 'Singtam', 'Ravangla',
  
  // Tamil Nadu
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Tiruppur', 'Salem', 'Erode', 'Tirunelveli',
  'Vellore', 'Thoothukudi', 'Thanjavur', 'Dindigul', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam',
  'Hosur', 'Nagercoil', 'Kancheepuram', 'Kumarapalayam', 'Karaikkudi', 'Neyveli', 'Cuddalore',
  'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 'Vaniyambadi',
  'Ambur', 'Nagapattinam', 'Kanchipuram', 'Palani', 'Theni', 'Virudhunagar', 'Tirupur', 'Namakkal',
  
  // Telangana
  'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam', 'Mahbubnagar', 'Mancherial',
  'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Nirmal', 'Kamareddy',
  'Kothagudem', 'Bodhan', 'Sangareddy', 'Metpally', 'Zaheerabad', 'Gadwal', 'Wanaparthy', 'Sadasivpet',
  
  // Tripura
  'Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai', 'Ambassa', 'Ranir Bazar',
  
  // Uttar Pradesh
  'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Prayagraj', 'Bareilly',
  'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar',
  'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Mau', 'Hapur', 'Ayodhya', 'Etawah', 'Mirzapur',
  'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich',
  'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki',
  'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah', 'Deoria', 'Ujhani', 'Ghazipur', 'Sultanpur',
  'Azamgarh', 'Bijnor', 'Sahaswan', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda', 'Greater Noida',
  
  // Uttarakhand
  'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh',
  'Ramnagar', 'Rudraprayag', 'Manglaur', 'Nainital', 'Mussoorie', 'Tehri', 'Pauri', 'Bageshwar',
  'Almora', 'Champawat', 'Sitarganj', 'Kichha', 'Jaspur', 'Kotdwar', 'Tanakpur', 'Khatima',
  
  // West Bengal
  'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Barddhaman', 'English Bazar',
  'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia',
  'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat',
  'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bolpur', 'Bangaon',
  
  // Union Territories
  // Delhi
  'New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh', 'Laxmi Nagar', 'Vasant Kunj',
  'Janakpuri', 'Mayur Vihar', 'Pitampura', 'Paschim Vihar', 'Punjabi Bagh', 'Preet Vihar',
  
  // Chandigarh
  'Chandigarh', 'Panchkula', 'Mohali',
  
  // Puducherry
  'Puducherry', 'Pondicherry', 'Karaikal', 'Mahe', 'Yanam',
  
  // Andaman and Nicobar Islands
  'Port Blair', 'Car Nicobar',
  
  // Dadra and Nagar Haveli
  'Silvassa',
  
  // Daman and Diu
  'Daman', 'Diu',
  
  // Lakshadweep
  'Kavaratti',
  
  // Ladakh
  'Leh', 'Kargil',
  
  // Jammu and Kashmir
  'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Udhampur', 'Kathua', 'Rajouri', 'Poonch',
  'Kupwara', 'Bandipore', 'Budgam', 'Pulwama', 'Kulgam', 'Shopian', 'Ganderbal', 'Samba', 'Reasi',
].sort();
