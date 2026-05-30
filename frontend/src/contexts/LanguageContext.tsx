import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'tr' | 'fr' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        'login.title': 'StockSenseAI',
        'login.subtitle': 'Enter the future of inventory management',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.submit': 'Access System',
        'login.loading': 'Authenticating...',
        'login.new': 'New to StockSenseAI?',
        'login.register': 'Initialize Account',
        'register.title': 'Initialization',
        'register.subtitle': 'Create or join a workspace',
        'register.new_ws': 'New Workspace',
        'register.join_ws': 'Join Existing',
        'register.confirm_password': 'Confirm Password',
        'register.supplier_code': 'Supplier Code (e.g. SUP-XXXX)',
        'register.submit': 'Establish Node',
        'register.loading': 'Processing...',
        'register.success': 'Success',
        'register.has_account': 'Already have access?',
        'register.login': 'Authenticate',
        'nav.dashboard': 'Dashboard',
        'nav.products': 'Products',
        'nav.warehouses': 'Warehouses',
        'nav.tasks': 'Tasks',
        'nav.suppliers': 'Suppliers',
        'nav.shipments': 'Shipments',
        'nav.reports': 'Reports',
        'nav.integrations': 'Integrations',
        'nav.ai_insights': 'AI Insights',
        'nav.staff': 'Staff',
        'nav.messages': 'Messages',
        'nav.logout': 'Disconnect',
        'theme.dark': 'Dark Mode',
        'theme.light': 'Light Mode',
        'dash.title': 'Command Center',
        'dash.subtitle': 'Real-time overview of your supply chain',
        'dash.total_products': 'Total Products',
        'dash.manage_inventory': 'Manage Inventory',
        'dash.active_tasks': 'Active Tasks',
        'dash.view_kanban': 'View Kanban Board',
        'dash.total_value': 'Total Value',
        'dash.ai_analytics': 'AI Analytics',
        'dash.low_stock': 'Low Stock Alerts',
        'dash.pdf_report': 'Generate PDF Report',
    },
    tr: {
        'login.title': 'StockSenseAI',
        'login.subtitle': 'Envanter yönetiminin geleceğine giriş yapın',
        'login.username': 'Kullanıcı Adı',
        'login.password': 'Şifre',
        'login.submit': 'Sisteme Gir',
        'login.loading': 'Doğrulanıyor...',
        'login.new': 'StockSenseAI\'da yeni misiniz?',
        'login.register': 'Hesap Oluştur',
        'register.title': 'Başlangıç',
        'register.subtitle': 'Bir çalışma alanı oluşturun veya katılın',
        'register.new_ws': 'Yeni Şirket',
        'register.join_ws': 'Mevcut Şirkete Katıl',
        'register.confirm_password': 'Şifreyi Onayla',
        'register.supplier_code': 'Tedarikçi Kodu (örn. SUP-XXXX)',
        'register.submit': 'Düğümü Kur',
        'register.loading': 'İşleniyor...',
        'register.success': 'Başarılı',
        'register.has_account': 'Zaten erişiminiz var mı?',
        'register.login': 'Giriş Yap',
        'nav.dashboard': 'Panel',
        'nav.products': 'Ürünler',
        'nav.warehouses': 'Depolar',
        'nav.tasks': 'Görevler',
        'nav.suppliers': 'Tedarikçiler',
        'nav.shipments': 'Sevkiyatlar',
        'nav.reports': 'Raporlar',
        'nav.integrations': 'Entegrasyonlar',
        'nav.ai_insights': 'Yapay Zeka',
        'nav.staff': 'Personel',
        'nav.messages': 'Mesajlarım',
        'nav.logout': 'Çıkış Yap',
        'theme.dark': 'Karanlık Mod',
        'theme.light': 'Aydınlık Mod',
        'dash.title': 'Komuta Merkezi',
        'dash.subtitle': 'Tedarik zincirinize gerçek zamanlı genel bakış',
        'dash.total_products': 'Toplam Ürün',
        'dash.manage_inventory': 'Envanteri Yönet',
        'dash.active_tasks': 'Aktif Görevler',
        'dash.view_kanban': 'Kanban Panosunu Gör',
        'dash.total_value': 'Toplam Değer',
        'dash.ai_analytics': 'Yapay Zeka Analitiği',
        'dash.low_stock': 'Düşük Stok Uyarıları',
        'dash.pdf_report': 'PDF Raporu Oluştur',
    },
    fr: {
        'login.title': 'StockSenseAI',
        'login.subtitle': 'Entrez dans l\'avenir de la gestion des stocks',
        'login.username': 'Nom d\'utilisateur',
        'login.password': 'Mot de passe',
        'login.submit': 'Accéder au Système',
        'login.loading': 'Authentification...',
        'login.new': 'Nouveau sur StockSenseAI?',
        'login.register': 'Créer un compte',
        'register.title': 'Initialisation',
        'register.subtitle': 'Créer ou rejoindre un espace de travail',
        'register.new_ws': 'Nouvel Espace',
        'register.join_ws': 'Rejoindre',
        'register.confirm_password': 'Confirmer le mot de passe',
        'register.supplier_code': 'Code Fournisseur (ex: SUP-XXXX)',
        'register.submit': 'Établir',
        'register.loading': 'Traitement...',
        'register.success': 'Succès',
        'register.has_account': 'Déjà un compte?',
        'register.login': 'S\'identifier',
        'nav.dashboard': 'Tableau de bord',
        'nav.products': 'Produits',
        'nav.warehouses': 'Entrepôts',
        'nav.tasks': 'Tâches',
        'nav.suppliers': 'Fournisseurs',
        'nav.shipments': 'Expéditions',
        'nav.reports': 'Rapports',
        'nav.integrations': 'Intégrations',
        'nav.ai_insights': 'IA Insights',
        'nav.staff': 'Personnel',
        'nav.messages': 'Messages',
        'nav.logout': 'Déconnecter',
        'theme.dark': 'Mode Sombre',
        'theme.light': 'Mode Clair',
        'dash.title': 'Centre de Commandement',
        'dash.subtitle': 'Aperçu en temps réel de votre chaîne d\'approvisionnement',
        'dash.total_products': 'Produits Totaux',
        'dash.manage_inventory': 'Gérer l\'inventaire',
        'dash.active_tasks': 'Tâches Actives',
        'dash.view_kanban': 'Voir le tableau Kanban',
        'dash.total_value': 'Valeur Totale',
        'dash.ai_analytics': 'Analytique IA',
        'dash.low_stock': 'Alertes de stock bas',
        'dash.pdf_report': 'Générer un rapport PDF',
    },
    es: {
        'login.title': 'StockSenseAI',
        'login.subtitle': 'Ingrese al futuro de la gestión de inventario',
        'login.username': 'Usuario',
        'login.password': 'Contraseña',
        'login.submit': 'Acceder al Sistema',
        'login.loading': 'Autenticando...',
        'login.new': '¿Nuevo en StockSenseAI?',
        'login.register': 'Crear Cuenta',
        'register.title': 'Inicialización',
        'register.subtitle': 'Crea o únete a un espacio de trabajo',
        'register.new_ws': 'Nuevo Espacio',
        'register.join_ws': 'Unirse',
        'register.confirm_password': 'Confirmar Contraseña',
        'register.supplier_code': 'Código de Proveedor (ej: SUP-XXXX)',
        'register.submit': 'Establecer Nodo',
        'register.loading': 'Procesando...',
        'register.success': 'Éxito',
        'register.has_account': '¿Ya tienes acceso?',
        'register.login': 'Autenticar',
        'nav.dashboard': 'Panel',
        'nav.products': 'Productos',
        'nav.warehouses': 'Almacenes',
        'nav.tasks': 'Tareas',
        'nav.suppliers': 'Proveedores',
        'nav.shipments': 'Envíos',
        'nav.reports': 'Informes',
        'nav.integrations': 'Integraciones',
        'nav.ai_insights': 'IA Insights',
        'nav.staff': 'Personal',
        'nav.messages': 'Mensajes',
        'nav.logout': 'Desconectar',
        'theme.dark': 'Modo Oscuro',
        'theme.light': 'Modo Claro',
        'dash.title': 'Centro de Mando',
        'dash.subtitle': 'Descripción general en tiempo real de su cadena de suministro',
        'dash.total_products': 'Productos Totales',
        'dash.manage_inventory': 'Gestionar Inventario',
        'dash.active_tasks': 'Tareas Activas',
        'dash.view_kanban': 'Ver Tablero Kanban',
        'dash.total_value': 'Valor Total',
        'dash.ai_analytics': 'Análisis de IA',
        'dash.low_stock': 'Alertas de Stock Bajo',
        'dash.pdf_report': 'Generar Informe PDF',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language') as Language;
        return ['en', 'tr', 'fr', 'es'].includes(saved) ? saved : 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
