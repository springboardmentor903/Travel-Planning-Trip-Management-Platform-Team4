package com.tripnest.tripnest_backend.config;

import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    private static final List<String> DEFAULT_ROLES = List.of("TRAVELER", "GROUP_ADMIN", "ADMINISTRATOR");

    @org.springframework.beans.factory.annotation.Value("${admin.initial.email:admin@tripnest.com}")
    private String initialAdminEmail;

    @org.springframework.beans.factory.annotation.Value("${admin.initial.password:Admin@123}")
    private String initialAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS destinations ADD COLUMN IF NOT EXISTS estimated_budget DOUBLE PRECISION");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS destinations ADD COLUMN IF NOT EXISTS best_travel_season VARCHAR(255)");
        } catch (Exception e) {
            // Ignore if columns already exist or DDL unsupported in test DB
        }

        DEFAULT_ROLES.forEach(roleName -> {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        });

        if (initialAdminEmail != null && !initialAdminEmail.isBlank() && !userRepository.existsByEmail(initialAdminEmail)) {
            Role adminRole = roleRepository.findByName("ADMINISTRATOR")
                    .orElseThrow(() -> new RuntimeException("ADMINISTRATOR role missing after seeding"));

            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail(initialAdminEmail);
            admin.setPasswordHash(passwordEncoder.encode(initialAdminPassword));
            admin.setRole(adminRole);
            admin.setOauthGoogle(false);
            userRepository.save(admin);
        }

        // Comprehensive seed list of world destinations
        List<Destination> defaultDestinations = Arrays.asList(
            // --- Preserved Core Destinations ---
            new Destination(null, "Paris", "France", "Paris", "The City of Light, famous for the Eiffel Tower, Louvre Museum, and rich culinary culture.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", "Metropolitan", 48.8566, 2.3522, 1500.0, "Spring & Fall"),
            new Destination(null, "Tokyo", "Japan", "Tokyo", "A bustling metropolis blending ultra-modern skyscrapers with historic temples and world-class cuisine.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26", "Metropolitan", 35.6762, 139.6503, 1800.0, "Spring & Autumn"),
            new Destination(null, "Bali", "Indonesia", "Denpasar", "Tropical paradise known for its volcanic mountains, iconic rice paddies, pristine beaches, and coral reefs.", "https://images.unsplash.com/photo-1537996194471-e657df975ab4", "Beach & Nature", -8.4095, 115.1889, 1000.0, "Apr - Oct"),
            new Destination(null, "New York", "United States", "New York", "The city that never sleeps, featuring Times Square, Central Park, Broadway theaters, and iconic skyline.", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9", "Metropolitan", 40.7128, -74.0060, 2000.0, "Sep - Nov, Dec"),
            new Destination(null, "Rome", "Italy", "Rome", "The Eternal City, home to the Colosseum, Roman Forum, Trevi Fountain, and Vatican City.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5", "Historical", 41.9028, 12.4964, 1400.0, "Apr - May, Sep - Oct"),
            new Destination(null, "London", "United Kingdom", "London", "A royal city steeped in history, featuring Big Ben, Tower Bridge, British Museum, and vibrant West End.", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad", "Metropolitan", 51.5074, -0.1278, 1900.0, "May - Sep"),
            new Destination(null, "Sydney", "Australia", "Sydney", "Breathtaking harbor city world-famous for the Sydney Opera House, Bondi Beach, and vibrant waterfront.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9", "Coastal", -33.8688, 151.2093, 1800.0, "Sep - Nov, Feb - Apr"),
            new Destination(null, "Dubai", "United Arab Emirates", "Dubai", "Futuristic city of luxury shopping, ultramodern architecture like the Burj Khalifa, and desert safaris.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", "Luxury", 25.2048, 55.2708, 2200.0, "Nov - Mar"),
            new Destination(null, "Santorini", "Greece", "Thira", "Iconic Aegean island with whitewashed cliffside villages, blue-domed churches, and volcanic beaches.", "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff", "Beach & Nature", 36.3932, 25.4615, 1600.0, "Apr - Nov"),
            new Destination(null, "Cairo", "Egypt", "Cairo", "Land of Pharaohs, featuring the Great Pyramids of Giza, the Sphinx, and the ancient Egyptian Museum.", "https://images.unsplash.com/photo-1572252821143-035a4d048d08", "Historical", 30.0444, 31.2357, 900.0, "Oct - Apr"),
            new Destination(null, "Kyoto", "Japan", "Kyoto", "Japan's cultural heartland, famed for classical Buddhist temples, gardens, shrines, and traditional tea houses.", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", "Cultural", 35.0116, 135.7681, 1500.0, "Mar - May, Oct - Nov"),
            new Destination(null, "Rio de Janeiro", "Brazil", "Rio de Janeiro", "Vibrant coastal city known for Copacabana and Ipanema beaches, Sugarloaf Mountain, and Christ the Redeemer.", "https://images.unsplash.com/photo-1483729558449-99ef09a8c325", "Beach & Nature", -22.9068, -43.1729, 1200.0, "Dec - Mar"),
            new Destination(null, "Barcelona", "Spain", "Barcelona", "Vibrant Catalan capital famous for Antoni Gaudí's Sagrada Família, Gothic Quarter, and Mediterranean coast.", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4", "Cultural", 41.3851, 2.1734, 1400.0, "May - Jun, Sep - Oct"),
            new Destination(null, "Cape Town", "South Africa", "Cape Town", "Breathtaking port city beneath Table Mountain, known for stunning coastlines, wineries, and wildlife reserves.", "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4", "Beach & Nature", -33.9249, 18.4241, 1300.0, "Nov - Mar"),
            new Destination(null, "Swiss Alps", "Switzerland", "Interlaken", "Majestic alpine landscape featuring snow-capped peaks, crystal-clear lakes, hiking trails, and ski resorts.", "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99", "Adventure", 46.5588, 8.5403, 2500.0, "Dec - Mar, Jun - Aug"),

            // --- India ---
            new Destination(null, "Hyderabad", "India", "Hyderabad", "City of Pearls famous for the historic Charminar, Golconda Fort, and world-renowned Hyderabadi biryani.", "https://images.unsplash.com/photo-1605379399642-870262d3d051", "Historical", 17.3850, 78.4867, 600.0, "Oct - Mar"),
            new Destination(null, "Visakhapatnam", "India", "Visakhapatnam", "Coastal gem featuring pristine RK Beach, Submarine Museum, and scenic Araku Valley hill landscapes.", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", "Beach & Nature", 17.6868, 83.2185, 500.0, "Oct - Mar"),
            new Destination(null, "Vijayawada", "India", "Vijayawada", "Cultural hub on the Krishna River home to Kanaka Durga Temple and ancient Undavalli Rock Caves.", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220", "Cultural", 16.5062, 80.6480, 450.0, "Nov - Feb"),
            new Destination(null, "Warangal", "India", "Warangal", "Heritage city of Kakatiya dynasty featuring the iconic Thousand Pillar Temple and Warangal Fort arches.", "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1", "Historical", 17.9689, 79.5941, 400.0, "Oct - Mar"),
            new Destination(null, "Bengaluru", "India", "Bengaluru", "India's Silicon Valley known for lush Lalbagh Botanical Gardens, craft breweries, and tech hubs.", "https://images.unsplash.com/photo-1596176530529-78163a4f7af2", "Metropolitan", 12.9716, 77.5946, 700.0, "Sep - Feb"),
            new Destination(null, "Mysuru", "India", "Mysuru", "Royal city famous for the grand Mysore Palace, Chamundi Hill Temple, and traditional silk weaving.", "https://images.unsplash.com/photo-1600100397608-f010e423b971", "Cultural", 12.2958, 76.6394, 500.0, "Oct - Mar"),
            new Destination(null, "Chennai", "India", "Chennai", "Gateway to South India featuring expansive Marina Beach, historic Dravidian temples, and classical arts.", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220", "Cultural", 13.0827, 80.2707, 600.0, "Nov - Feb"),
            new Destination(null, "Ooty", "India", "Ooty", "Queen of Hill Stations featuring tea gardens, Nilgiri Toy Train, and misty mountain landscapes.", "https://images.unsplash.com/photo-1544644181-1484b3fdfc62", "Beach & Nature", 11.4102, 76.6950, 550.0, "Oct - Jun"),
            new Destination(null, "Kochi", "India", "Kochi", "Port city blending Chinese fishing nets, Portuguese history, Fort Kochi heritage, and spice markets.", "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944", "Coastal", 9.9312, 76.2673, 650.0, "Oct - Mar"),
            new Destination(null, "Munnar", "India", "Munnar", "Serene hill station renowned for sprawling green tea estates, Anamudi peak, and misty valleys.", "https://images.unsplash.com/photo-1593693397690-362cb9666fc2", "Beach & Nature", 10.0889, 77.0595, 500.0, "Sep - May"),
            new Destination(null, "Thiruvananthapuram", "India", "Thiruvananthapuram", "Capital city of Kerala home to the opulent Padmanabhaswamy Temple and Kovalam Beach coastline.", "https://images.unsplash.com/photo-1609946782759-810d64f1b5f7", "Coastal", 8.5241, 76.9366, 550.0, "Oct - Feb"),
            new Destination(null, "Goa", "India", "Goa", "India's beach capital renowned for golden sands, vibrant nightlife, Portuguese churches, and spice plantations.", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", "Beach & Nature", 15.2993, 74.1240, 800.0, "Nov - Feb"),
            new Destination(null, "Mumbai", "India", "Mumbai", "Financial powerhouse of India, home to Bollywood, Gateway of India, and Marine Drive boulevard.", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f", "Metropolitan", 19.0760, 72.8777, 900.0, "Oct - Mar"),
            new Destination(null, "Pune", "India", "Pune", "Cultural and educational capital of Maharashtra featuring Shaniwar Wada fort and Aga Khan Palace.", "https://images.unsplash.com/photo-1616489953149-75b94f1c990a", "Cultural", 18.5204, 73.8567, 600.0, "Oct - Feb"),
            new Destination(null, "Jaipur", "India", "Jaipur", "The Pink City of Rajasthan featuring Hawa Mahal, Amber Fort, and grand royal palaces.", "https://images.unsplash.com/photo-1477587458883-47145ed94245", "Historical", 26.9124, 75.7873, 750.0, "Oct - Mar"),
            new Destination(null, "Udaipur", "India", "Udaipur", "The City of Lakes featuring romantic Lake Palace, City Palace complex, and sunset boat rides.", "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10", "Luxury", 24.5854, 73.7125, 850.0, "Sep - Mar"),
            new Destination(null, "Jodhpur", "India", "Jodhpur", "The Blue City dominated by the mighty Mehrangarh Fort towering above blue-painted old city houses.", "https://images.unsplash.com/photo-1562979314-bee7453e911c", "Historical", 26.2389, 73.0243, 600.0, "Oct - Mar"),
            new Destination(null, "Jaisalmer", "India", "Jaisalmer", "The Golden City located in the Thar Desert, famed for its yellow sandstone fort and desert safari camps.", "https://images.unsplash.com/photo-1589308078059-be1415eab4c3", "Luxury", 26.9157, 70.9083, 650.0, "Oct - Mar"),
            new Destination(null, "New Delhi", "India", "New Delhi", "Capital of India blending Mughal history at Qutub Minar and Red Fort with modern diplomatic avenues.", "https://images.unsplash.com/photo-1587474260584-136574528ed5", "Metropolitan", 28.6139, 77.2090, 800.0, "Oct - Mar"),
            new Destination(null, "Agra", "India", "Agra", "Home of the magnificent Taj Mahal, Agra Fort, and rich Mughal architectural monuments.", "https://images.unsplash.com/photo-1564507592333-c60657eea523", "Historical", 27.1767, 78.0081, 500.0, "Oct - Mar"),
            new Destination(null, "Varanasi", "India", "Varanasi", "Spiritual capital of India located on the sacred Ganges River, famous for ancient ghats and evening Aarti.", "https://images.unsplash.com/photo-1561361513-2d000a50f0dc", "Cultural", 25.3176, 82.9739, 450.0, "Oct - Mar"),
            new Destination(null, "Rishikesh", "India", "Rishikesh", "Yoga Capital of the World along the holy Ganges, known for white-water rafting, ashrams, and Laxman Jhula.", "https://images.unsplash.com/photo-1596176530529-78163a4f7af2", "Adventure", 30.0869, 78.2676, 500.0, "Sep - Jun"),
            new Destination(null, "Amritsar", "India", "Amritsar", "Spiritual center of Sikhism home to the revered Golden Temple and historic Jallianwala Bagh.", "https://images.unsplash.com/photo-1588096344316-f71c8f44d95a", "Cultural", 31.6340, 74.8723, 450.0, "Oct - Mar"),
            new Destination(null, "Shimla", "India", "Shimla", "Colonial summer capital featuring Mall Road, Christ Church, and snow-capped Himalayan mountain panoramas.", "https://images.unsplash.com/photo-1597074866923-dc058865b05e", "Beach & Nature", 31.1048, 77.1734, 600.0, "Mar - Jun, Dec - Jan"),
            new Destination(null, "Manali", "India", "Manali", "Himalayan resort town famous for Solang Valley adventure sports, Rohtang Pass, and pine forests.", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", "Adventure", 32.2432, 77.1892, 650.0, "Oct - Jun"),
            new Destination(null, "Leh", "India", "Leh", "High-altitude desert in Ladakh featuring Pangong Lake, Khardung La pass, and ancient Tibetan monasteries.", "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2", "Adventure", 34.1526, 77.5771, 800.0, "May - Sep"),
            new Destination(null, "Srinagar", "India", "Srinagar", "Summer capital of Jammu and Kashmir famous for Dal Lake houseboats, Shikara rides, and Shalimar Gardens.", "https://images.unsplash.com/photo-1595815771614-ade9d652a65d", "Beach & Nature", 34.0837, 74.7973, 700.0, "Apr - Oct"),
            new Destination(null, "Darjeeling", "India", "Darjeeling", "Himalayan town famous for worldview of Kanchenjunga peak, world-renowned tea gardens, and Toy Train.", "https://images.unsplash.com/photo-1544644181-1484b3fdfc62", "Beach & Nature", 27.0410, 88.2663, 550.0, "Apr - Jun, Oct - Dec"),
            new Destination(null, "Gangtok", "India", "Gangtok", "Capital of Sikkim featuring views of Mount Kanchenjunga, Rumtek Monastery, and pristine Nathula Pass.", "https://images.unsplash.com/photo-1609946782759-810d64f1b5f7", "Adventure", 27.3389, 88.6065, 600.0, "Oct - May"),
            new Destination(null, "Kolkata", "India", "Kolkata", "Cultural capital of India featuring Howrah Bridge, Victoria Memorial, colonial heritage, and Durga Puja.", "https://images.unsplash.com/photo-1558431382-27e303142255", "Cultural", 22.5726, 88.3639, 650.0, "Oct - Mar"),
            new Destination(null, "Bhubaneswar", "India", "Bhubaneswar", "Temple City of India renowned for Lingaraj Temple, Kalinga architectural heritage, and Khandagiri caves.", "https://images.unsplash.com/photo-1600100397608-f010e423b971", "Historical", 20.2961, 85.8245, 450.0, "Oct - Mar"),
            new Destination(null, "Puri", "India", "Puri", "Holy beach city famous for Jagannath Temple, Golden Beach, and annual Rath Yatra chariot festival.", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", "Beach & Nature", 19.8135, 85.8312, 450.0, "Oct - Feb"),
            new Destination(null, "Ahmedabad", "India", "Ahmedabad", "UNESCO World Heritage city featuring Sabarmati Ashram, intricate stepwells, and vibrant textile heritage.", "https://images.unsplash.com/photo-1616489953149-75b94f1c990a", "Cultural", 23.0225, 72.5714, 600.0, "Oct - Mar"),
            new Destination(null, "Surat", "India", "Surat", "Thriving commercial city on the Tapti River known for diamond cutting, silk fabrics, and coastal cuisine.", "https://images.unsplash.com/photo-1596176530529-78163a4f7af2", "Metropolitan", 21.1702, 72.8311, 550.0, "Oct - Mar"),
            new Destination(null, "Nashik", "India", "Nashik", "Wine capital of India on the Godavari River, known for Sula Vineyards and ancient Trimbakeshwar temple.", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3", "Cultural", 19.9975, 73.7898, 500.0, "Oct - Mar"),
            new Destination(null, "Chhatrapati Sambhajinagar", "India", "Chhatrapati Sambhajinagar", "Heritage city featuring UNESCO Ajanta and Ellora Caves, Bibi Ka Maqbara, and Daulatabad Fort.", "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1", "Historical", 19.8762, 75.3433, 500.0, "Oct - Mar"),
            new Destination(null, "Andaman Islands", "India", "Port Blair", "Tropical island archipelago featuring Radhanagar Beach, Celluar Jail heritage, and turquoise scuba waters.", "https://images.unsplash.com/photo-1589308078059-be1415eab4c3", "Beach & Nature", 11.6233, 92.7265, 1000.0, "Oct - May"),

            // --- Asia ---
            new Destination(null, "Osaka", "Japan", "Osaka", "Japan's street food capital famous for Osaka Castle, Dotonbori neon district, and Universal Studios.", "https://images.unsplash.com/photo-1590559899731-a382839e5549", "Metropolitan", 34.6937, 135.5023, 1400.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Seoul", "South Korea", "Seoul", "Dynamic capital combining futuristic tech hubs, K-pop culture, Gyeongbokgung Palace, and street markets.", "https://images.unsplash.com/photo-1538485399081-7191377e8241", "Metropolitan", 37.5665, 126.9780, 1500.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Singapore", "Singapore", "Singapore", "Global financial island hub featuring Gardens by the Bay, Marina Bay Sands, and multicultural street food.", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd", "Metropolitan", 1.3521, 103.8198, 1800.0, "Year-round"),
            new Destination(null, "Bangkok", "Thailand", "Bangkok", "Vibrant Thai capital known for ornate Grand Palace, floating markets, street food stalls, and nightlife.", "https://images.unsplash.com/photo-1508009603885-50cf7c579365", "Metropolitan", 13.7563, 100.5018, 900.0, "Nov - Feb"),
            new Destination(null, "Phuket", "Thailand", "Phuket", "Thailand's largest island famous for Patong Beach, Phi Phi island tours, and tropical luxury resorts.", "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5", "Beach & Nature", 7.8804, 98.3923, 1000.0, "Nov - Apr"),
            new Destination(null, "Jakarta", "Indonesia", "Jakarta", "Sprawling capital of Indonesia featuring the National Monument, Old Town Kota Tua, and vibrant malls.", "https://images.unsplash.com/photo-1555899434-94d1368aa7af", "Metropolitan", -6.2088, 106.8456, 800.0, "Jun - Sep"),
            new Destination(null, "Kuala Lumpur", "Malaysia", "Kuala Lumpur", "Malaysian capital dominated by the iconic Petronas Twin Towers, Batu Caves, and night markets.", "https://images.unsplash.com/photo-1596422846543-75c6fc197f07", "Metropolitan", 3.1390, 101.6869, 1000.0, "May - Jul"),
            new Destination(null, "Hong Kong", "Hong Kong", "Hong Kong", "Dazzling harbor skyline, Victoria Peak vistas, bustling street markets, and world-class dim sum.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9", "Metropolitan", 22.3193, 114.1694, 1700.0, "Oct - Dec"),
            new Destination(null, "Taipei", "Taiwan", "Taipei", "Taiwanese capital famous for Taipei 101 tower, Shilin Night Market, hot springs, and teahouses.", "https://images.unsplash.com/photo-1543158266-0066955047b1", "Metropolitan", 25.0330, 121.5654, 1200.0, "Oct - Dec"),
            new Destination(null, "Beijing", "China", "Beijing", "Ancient capital of China home to the Forbidden City, Temple of Heaven, and the Great Wall of China.", "https://images.unsplash.com/photo-1508804185872-d7badad00f7d", "Historical", 39.9042, 116.4074, 1300.0, "Sep - Nov"),
            new Destination(null, "Shanghai", "China", "Shanghai", "China's financial center featuring the iconic Bund waterfront skyline, Yu Garden, and Oriental Pearl Tower.", "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab396", "Metropolitan", 31.2304, 121.4737, 1400.0, "Oct - Nov"),
            new Destination(null, "Abu Dhabi", "United Arab Emirates", "Abu Dhabi", "Capital of UAE featuring Sheikh Zayed Grand Mosque, Louvre Abu Dhabi, and luxury desert resorts.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", "Luxury", 24.4539, 54.3773, 2000.0, "Oct - Apr"),
            new Destination(null, "Doha", "Qatar", "Doha", "Peninsular capital featuring futuristic West Bay skyline, Museum of Islamic Art, and Souq Waqif bazaar.", "https://images.unsplash.com/photo-1578895210405-907db48a7111", "Luxury", 25.2854, 51.5310, 1900.0, "Nov - Mar"),
            new Destination(null, "Istanbul", "Turkey", "Istanbul", "Transcontinental city bridging Europe and Asia, featuring Hagia Sophia, Blue Mosque, and Grand Bazaar.", "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200", "Historical", 41.0082, 28.9784, 1100.0, "Sep - Nov"),

            // --- Europe ---
            new Destination(null, "Madrid", "Spain", "Madrid", "Spanish capital featuring Royal Palace, Prado Museum, vibrant tapas bars, and Retiro Park.", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4", "Cultural", 40.4168, -3.7038, 1500.0, "Sep - Nov"),
            new Destination(null, "Amsterdam", "Netherlands", "Amsterdam", "Picturesque Dutch city famous for its canal ring, Van Gogh Museum, Rijksmuseum, and bicycle culture.", "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4", "Metropolitan", 52.3676, 4.9041, 1700.0, "Apr - May, Sep - Nov"),
            new Destination(null, "Berlin", "Germany", "Berlin", "Germany's creative capital famous for Brandenburg Gate, Berlin Wall Memorial, and vibrant nightlife.", "https://images.unsplash.com/photo-1560969184-10fe8719e047", "Metropolitan", 52.5200, 13.4050, 1600.0, "May - Sep"),
            new Destination(null, "Vienna", "Austria", "Vienna", "Imperial capital of music and palaces, home to Schönbrunn Palace, St. Stephen's Cathedral, and coffeehouses.", "https://images.unsplash.com/photo-1516550893923-42d28e5677af", "Cultural", 48.2082, 16.3738, 1600.0, "Apr - May, Sep - Oct"),
            new Destination(null, "Prague", "Czech Republic", "Prague", "The City of a Hundred Spires featuring Charles Bridge, Prague Castle, and Astronomical Clock.", "https://images.unsplash.com/photo-1541849546-216549ae216d", "Historical", 50.0755, 14.4378, 1200.0, "May - Sep"),
            new Destination(null, "Budapest", "Hungary", "Budapest", "Pearl of the Danube featuring Hungarian Parliament Building, Fisherman's Bastion, and thermal baths.", "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb", "Historical", 47.4979, 19.0402, 1100.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Zurich", "Switzerland", "Zurich", "Alpine financial capital situated on Lake Zurich, known for Bahnhofstrasse shopping and medieval Altstadt.", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4", "Luxury", 47.3769, 8.5417, 2200.0, "Jun - Aug"),
            new Destination(null, "Geneva", "Switzerland", "Geneva", "Global diplomacy city on Lake Geneva featuring the Jet d'Eau fountain, UN Headquarters, and watchmaking.", "https://images.unsplash.com/photo-1572252821143-035a4d048d08", "Luxury", 46.2044, 6.1432, 2100.0, "Jun - Sep"),
            new Destination(null, "Venice", "Italy", "Venice", "Romantic lagoon city of canals, gondolas, St. Mark's Basilica, Doge's Palace, and Rialto Bridge.", "https://images.unsplash.com/photo-1514890547357-a9ee288728e0", "Historical", 45.4408, 12.3155, 1800.0, "Apr - May, Sep - Oct"),
            new Destination(null, "Florence", "Italy", "Florence", "Cradle of the Renaissance featuring Florence Cathedral Duomo, Uffizi Gallery, and Ponte Vecchio.", "https://images.unsplash.com/photo-1543429776-2782fc8e1acd", "Cultural", 43.7696, 11.2558, 1600.0, "May - Sep"),
            new Destination(null, "Athens", "Greece", "Athens", "Birthplace of Western civilization, home to the ancient Acropolis, Parthenon, and Plaka district.", "https://images.unsplash.com/photo-1555993539-1732b0258235", "Historical", 37.9838, 23.7275, 1300.0, "Apr - Jun, Sep - Nov"),
            new Destination(null, "Lisbon", "Portugal", "Lisbon", "Sun-kissed coastal city featuring Belém Tower, Tram 28 rides, Alfama district, and pastel de nata.", "https://images.unsplash.com/photo-1509986892044-977709e1b216", "Coastal", 38.7223, -9.1393, 1300.0, "Mar - May, Sep - Oct"),
            new Destination(null, "Dublin", "Ireland", "Dublin", "Vibrant Irish capital famous for Trinity College Library, Guinness Storehouse, and Temple Bar pubs.", "https://images.unsplash.com/photo-1549918864-48ac978761a4", "Cultural", 53.3498, -6.2603, 1600.0, "Jun - Aug"),
            new Destination(null, "Brussels", "Belgium", "Brussels", "Capital of Belgium home to the ornate Grand Place, Atomium landmark, and world-class chocolates.", "https://images.unsplash.com/photo-1563276332-901416b0b2e8", "Metropolitan", 50.8503, 4.3517, 1500.0, "May - Sep"),
            new Destination(null, "Copenhagen", "Denmark", "Copenhagen", "Charming Scandinavian capital famous for Nyhavn colorful harbor, Tivoli Gardens, and Little Mermaid.", "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc", "Metropolitan", 55.6761, 12.5683, 1900.0, "May - Aug"),
            new Destination(null, "Stockholm", "Sweden", "Stockholm", "Nordic capital built across 14 islands, featuring Gamla Stan old town, Vasa Museum, and Royal Palace.", "https://images.unsplash.com/photo-1509356843151-3e7d96241e11", "Metropolitan", 59.3293, 18.0686, 1800.0, "May - Sep"),
            new Destination(null, "Oslo", "Norway", "Oslo", "Coastal Scandinavian city surrounded by fjords, featuring Vigeland Sculpture Park and Opera House.", "https://images.unsplash.com/photo-1579003087287-997fd4d18771", "Beach & Nature", 59.9139, 10.7522, 2000.0, "May - Aug"),
            new Destination(null, "Reykjavik", "Iceland", "Reykjavik", "Gateway to geothermal wonders, Northern Lights displays, Blue Lagoon spa, and volcanic glaciers.", "https://images.unsplash.com/photo-1504829857797-ddff29c27927", "Adventure", 64.1466, -21.9426, 2100.0, "Jun - Aug, Sep - Mar"),

            // --- North America ---
            new Destination(null, "Los Angeles", "United States", "Los Angeles", "Entertainment capital home to Hollywood Walk of Fame, Santa Monica Pier, and Universal Studios.", "https://images.unsplash.com/photo-1580655653885-65763b2597d0", "Metropolitan", 34.0522, -118.2437, 2000.0, "Mar - May, Sep - Nov"),
            new Destination(null, "San Francisco", "United States", "San Francisco", "Famous bay city featuring the Golden Gate Bridge, Alcatraz Island, cable cars, and Fisherman's Wharf.", "https://images.unsplash.com/photo-1501594907352-04cda38ebc29", "Metropolitan", 37.7749, -122.4194, 2200.0, "Sep - Nov"),
            new Destination(null, "Las Vegas", "United States", "Las Vegas", "World's entertainment capital famous for resort casinos, spectacular Strip shows, and nightlife.", "https://images.unsplash.com/photo-1581351123004-757df051db8e", "Luxury", 36.1699, -115.1398, 1800.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Chicago", "United States", "Chicago", "Windy City known for Cloud Gate (The Bean), Willis Tower skydeck, deep-dish pizza, and Lake Michigan.", "https://images.unsplash.com/photo-1494522855154-9297ac14b55f", "Metropolitan", 41.8781, -87.6298, 1800.0, "May - Sep"),
            new Destination(null, "Miami", "United States", "Miami", "Sun-soaked paradise known for South Beach Art Deco district, Little Havana, and vibrant nightlife.", "https://images.unsplash.com/photo-1506966953377-3f925a26e07a", "Beach & Nature", 25.7617, -80.1918, 1900.0, "Nov - Apr"),
            new Destination(null, "Orlando", "United States", "Orlando", "Theme park capital of the world featuring Walt Disney World Resort, Universal Studios, and water parks.", "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc", "Adventure", 28.5383, -81.3792, 1700.0, "Jan - Apr"),
            new Destination(null, "Boston", "United States", "Boston", "Historic city home to the Freedom Trail, Harvard University, Fenway Park, and harbor cruises.", "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb", "Historical", 42.3601, -71.0589, 1900.0, "Jun - Oct"),
            new Destination(null, "Seattle", "United States", "Seattle", "Pacific Northwest gem featuring the iconic Space Needle, Pike Place Market, and surrounding mountains.", "https://images.unsplash.com/photo-1502175353174-a7a70e73b362", "Beach & Nature", 47.6062, -122.3321, 1900.0, "Jun - Sep"),
            new Destination(null, "Washington, D.C.", "United States", "Washington, D.C.", "Capital of US featuring the White House, US Capitol, Lincoln Memorial, and free Smithsonian museums.", "https://images.unsplash.com/photo-1501466044931-62695aada8e9", "Historical", 38.9072, -77.0369, 1800.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Toronto", "Canada", "Toronto", "Canada's largest metropolis dominated by the CN Tower, Royal Ontario Museum, and waterfront islands.", "https://images.unsplash.com/photo-1507992781348-310259076fe0", "Metropolitan", 43.6532, -79.3832, 1700.0, "May - Sep"),
            new Destination(null, "Vancouver", "Canada", "Vancouver", "Scenic Pacific coast city surrounded by snow-capped mountains, Stanley Park, and Granville Island.", "https://images.unsplash.com/photo-1559511260-66a654ae982a", "Beach & Nature", 49.2827, -123.1207, 1800.0, "Jun - Sep"),
            new Destination(null, "Montreal", "Canada", "Montreal", "French-influenced cultural hub known for Old Montreal cobblestones, Notre-Dame Basilica, and festivals.", "https://images.unsplash.com/photo-1519178614-68693b05f24f", "Cultural", 45.5017, -73.5673, 1600.0, "Jun - Sep"),
            new Destination(null, "Mexico City", "Mexico", "Mexico City", "Vibrant ancient capital featuring Zócalo plaza, Frida Kahlo Museum, and Teotihuacan pyramids.", "https://images.unsplash.com/photo-1512813195386-6cf811ad3542", "Cultural", 19.4326, -99.1332, 1000.0, "Mar - May"),
            new Destination(null, "Cancun", "Mexico", "Cancun", "Mexican Caribbean paradise famous for white sand beaches, Maya Riviera ruins, and turquoise waters.", "https://images.unsplash.com/photo-1510097467424-192d713fd8b2", "Beach & Nature", 21.1619, -86.8515, 1400.0, "Dec - Apr"),

            // --- South America ---
            new Destination(null, "Sao Paulo", "Brazil", "Sao Paulo", "Brazil's bustling metropolis known for Avenida Paulista, world-class gastronomy, and vibrant art scene.", "https://images.unsplash.com/photo-1543059080-f9b1272213d5", "Metropolitan", -23.5505, -46.6333, 1200.0, "Mar - May, Oct - Nov"),
            new Destination(null, "Buenos Aires", "Argentina", "Buenos Aires", "Paris of South America famous for tango dancing, Plaza de Mayo, Casa Rosada, and steak houses.", "https://images.unsplash.com/photo-1589909202802-8f4aadce1849", "Cultural", -34.6037, -58.3816, 1100.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Lima", "Peru", "Lima", "Gastronomic capital of South America overlooking the Pacific Ocean, famous for ceviche and historic centre.", "https://images.unsplash.com/photo-1526392060635-9d6019884377", "Cultural", -12.0464, -77.0428, 1000.0, "Dec - Apr"),
            new Destination(null, "Cusco", "Peru", "Cusco", "Ancient Incan Empire capital and main gateway to the breathtaking Machu Picchu citadel.", "https://images.unsplash.com/photo-1526392060635-9d6019884377", "Historical", -13.5319, -71.9675, 900.0, "May - Sep"),
            new Destination(null, "Santiago", "Chile", "Santiago", "Chilean capital nestled beside the dramatic snow-capped Andes mountains, surrounded by vineyards.", "https://images.unsplash.com/photo-1589909202802-8f4aadce1849", "Beach & Nature", -33.4489, -70.6693, 1300.0, "Sep - Nov"),
            new Destination(null, "Bogota", "Colombia", "Bogota", "High-altitude Colombian capital famous for La Candelaria historic district, Gold Museum, and Monserrate.", "https://images.unsplash.com/photo-1583531172005-814191b8b6c0", "Cultural", 4.7110, -74.0721, 900.0, "Dec - Mar"),

            // --- Africa ---
            new Destination(null, "Johannesburg", "South Africa", "Johannesburg", "South Africa's largest city featuring the Apartheid Museum, Soweto history, and Gold Reef City.", "https://images.unsplash.com/photo-1577948000111-9c769d264435", "Cultural", -26.2041, 28.0473, 1200.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Marrakesh", "Morocco", "Marrakesh", "Enchanting imperial city famous for Djemaa el-Fna square, colorful souks, and Bahia Palace.", "https://images.unsplash.com/photo-1597212618440-806262de4f6b", "Cultural", 31.6295, -7.9811, 1000.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Nairobi", "Kenya", "Nairobi", "Safari capital featuring Nairobi National Park, David Sheldrick Elephant Orphanage, and Giraffe Centre.", "https://images.unsplash.com/photo-1609137144813-7d9921338f24", "Adventure", -1.2921, 36.8219, 1300.0, "Jul - Oct"),
            new Destination(null, "Zanzibar", "Tanzania", "Zanzibar", "Spicy island paradise with white-sand beaches, Stone Town UNESCO heritage, and coral reef diving.", "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe", "Beach & Nature", -6.1659, 39.2026, 1400.0, "Jun - Oct, Dec - Feb"),
            new Destination(null, "Victoria Falls", "Zimbabwe", "Victoria Falls", "One of the Seven Natural Wonders of the World, featuring the majestic cascading Zambezi River waterfall.", "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb", "Adventure", -17.9244, 25.8572, 1500.0, "Feb - May"),

            // --- Oceania ---
            new Destination(null, "Melbourne", "Australia", "Melbourne", "Australia's cultural capital famous for laneway coffee shops, street art, Yarra River, and sports.", "https://images.unsplash.com/photo-1514395462725-fb4566210144", "Metropolitan", -37.8136, 144.9631, 1800.0, "Mar - May, Sep - Nov"),
            new Destination(null, "Brisbane", "Australia", "Brisbane", "Sun-soaked Queensland city featuring South Bank artificial beach, river cruises, and koala sanctuaries.", "https://images.unsplash.com/photo-1566737236500-c8ac43014a67", "Coastal", -27.4705, 153.0260, 1700.0, "May - Oct"),
            new Destination(null, "Perth", "Australia", "Perth", "Western Australia capital featuring Kings Park botanical gardens, Cottesloe Beach, and Rottnest Island.", "https://images.unsplash.com/photo-1574872952488-82555ca226d9", "Coastal", -31.9505, 115.8605, 1700.0, "Sep - Nov"),
            new Destination(null, "Auckland", "New Zealand", "Auckland", "City of Sails featuring the iconic Sky Tower, Waitematā Harbour, volcanic Rangitoto Island, and wineries.", "https://images.unsplash.com/photo-1507699622108-4be3abd695ad", "Beach & Nature", -36.8485, 174.7633, 1800.0, "Nov - Mar"),
            new Destination(null, "Queenstown", "New Zealand", "Queenstown", "Adventure capital of the world set on Lake Wakatipu, famous for bungee jumping, skiing, and Milford Sound.", "https://images.unsplash.com/photo-1589871973318-9ca1258faa5d", "Adventure", -45.0312, 168.6626, 1900.0, "Dec - Feb, Jun - Aug"),
            new Destination(null, "Wellington", "New Zealand", "Wellington", "Vibrant kiwi capital home to Te Papa Museum, Mount Victoria lookouts, cable car, and film studios.", "https://images.unsplash.com/photo-1589871973318-9ca1258faa5d", "Cultural", -41.2865, 174.7762, 1700.0, "Nov - Mar")
        );

        for (Destination target : defaultDestinations) {
            Destination existing = destinationRepository.findByName(target.getName()).orElse(null);
            if (existing == null) {
                destinationRepository.save(target);
            } else {
                // Ensure coordinates, category, image URL, budget, and season are fully populated
                if (existing.getCategory() == null) existing.setCategory(target.getCategory());
                if (existing.getLatitude() == null) existing.setLatitude(target.getLatitude());
                if (existing.getLongitude() == null) existing.setLongitude(target.getLongitude());
                if (existing.getImageUrl() == null || existing.getImageUrl().isEmpty()) existing.setImageUrl(target.getImageUrl());
                if (existing.getEstimatedBudget() == null) existing.setEstimatedBudget(target.getEstimatedBudget());
                if (existing.getBestTravelSeason() == null) existing.setBestTravelSeason(target.getBestTravelSeason());
                destinationRepository.save(existing);
            }
        }
    }
}
