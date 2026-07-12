// Comprehensive Device Database with major brands and model series
export interface DeviceModelTemplate {
  model: string;
  ram: string;
  refreshRate: string;
  touchSamplingRate: string;
  resolution: string;
  screenSize: string;
  gyroscope: boolean;
  os: string;
}

export const BRANDS_LIST = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Redmi',
  'POCO',
  'Google Pixel',
  'Huawei',
  'Honor',
  'Oppo',
  'Vivo',
  'Realme',
  'OnePlus',
  'Nothing',
  'Infinix',
  'TECNO',
  'itel',
  'Nokia',
  'Motorola',
  'Sony',
  'ASUS ROG',
  'Black Shark',
  'Lenovo',
  'LG',
  'HTC',
  'ZTE',
  'Meizu',
  'Sharp',
  'Lava',
  'Micromax',
  'Blu',
  'Cubot',
  'Doogee',
  'Blackview',
  'Oukitel',
  'Ulefone',
  'Umidigi'
];

export const DEVICE_MODELS_MAP: Record<string, DeviceModelTemplate[]> = {
  'Apple': [
    { model: 'iPhone 16 Pro Max', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'Super Retina XDR', screenSize: '6.9"', gyroscope: true, os: 'iOS 18' },
    { model: 'iPhone 16 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'Super Retina XDR', screenSize: '6.3"', gyroscope: true, os: 'iOS 18' },
    { model: 'iPhone 16 Plus', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.7"', gyroscope: true, os: 'iOS 18' },
    { model: 'iPhone 16', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.1"', gyroscope: true, os: 'iOS 18' },
    { model: 'iPhone 15 Pro Max', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'Super Retina XDR', screenSize: '6.7"', gyroscope: true, os: 'iOS 17' },
    { model: 'iPhone 15 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'Super Retina XDR', screenSize: '6.1"', gyroscope: true, os: 'iOS 17' },
    { model: 'iPhone 15', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.1"', gyroscope: true, os: 'iOS 17' },
    { model: 'iPhone 14 Pro Max', ram: '6 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'Super Retina XDR', screenSize: '6.7"', gyroscope: true, os: 'iOS 16' },
    { model: 'iPhone 14', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.1"', gyroscope: true, os: 'iOS 16' },
    { model: 'iPhone 13 Pro Max', ram: '6 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'Super Retina XDR', screenSize: '6.7"', gyroscope: true, os: 'iOS 15' },
    { model: 'iPhone 13', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.1"', gyroscope: true, os: 'iOS 15' },
    { model: 'iPhone 12 Pro Max', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.7"', gyroscope: true, os: 'iOS 14' },
    { model: 'iPhone 12', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.1"', gyroscope: true, os: 'iOS 14' },
    { model: 'iPhone 11 Pro Max', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina XDR', screenSize: '6.5"', gyroscope: true, os: 'iOS 13' },
    { model: 'iPhone 11', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Liquid Retina HD', screenSize: '6.1"', gyroscope: true, os: 'iOS 13' },
    { model: 'iPhone XS Max', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina HD', screenSize: '6.5"', gyroscope: true, os: 'iOS 12' },
    { model: 'iPhone X', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'Super Retina HD', screenSize: '5.8"', gyroscope: true, os: 'iOS 11' },
    { model: 'iPhone 8 Plus', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'Retina HD', screenSize: '5.5"', gyroscope: true, os: 'iOS 11' },
    { model: 'iPhone 7 Plus', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'Retina HD', screenSize: '5.5"', gyroscope: true, os: 'iOS 10' },
    { model: 'iPhone 7', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'Retina HD', screenSize: '4.7"', gyroscope: true, os: 'iOS 10' },
    { model: 'iPhone 6s Plus', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'Retina HD', screenSize: '5.5"', gyroscope: true, os: 'iOS 9' },
    { model: 'iPhone 6s', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'Retina HD', screenSize: '4.7"', gyroscope: true, os: 'iOS 9' },
    { model: 'iPhone 6 Plus', ram: '1 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'Retina HD', screenSize: '5.5"', gyroscope: true, os: 'iOS 8' },
    { model: 'iPhone 6', ram: '1 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'Retina HD', screenSize: '4.7"', gyroscope: true, os: 'iOS 8' }
  ],
  'Samsung': [
    { model: 'Galaxy S24 Ultra', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 14' },
    { model: 'Galaxy S24+', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 14' },
    { model: 'Galaxy S24', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.2"', gyroscope: true, os: 'Android 14' },
    { model: 'Galaxy S23 Ultra', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 13' },
    { model: 'Galaxy S22 Ultra', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 12' },
    { model: 'Galaxy S21 Ultra', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 11' },
    { model: 'Galaxy S20 FE', ram: '6 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.5"', gyroscope: true, os: 'Android 10' },
    { model: 'Galaxy A55 5G', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.6"', gyroscope: true, os: 'Android 14' },
    { model: 'Galaxy A35 5G', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.6"', gyroscope: true, os: 'Android 14' },
    { model: 'Galaxy A15', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.5"', gyroscope: true, os: 'Android 14' },
    { model: 'Galaxy A05s', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: false, os: 'Android 13' },
    { model: 'Galaxy A04', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.5"', gyroscope: false, os: 'Android 12' },
    { model: 'Galaxy M54 5G', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 13' }
  ],
  'Infinix': [
    // GT Series
    { model: 'GT 20 Pro', ram: '12 GB', refreshRate: '144Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'GT 10 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 13' },
    // Zero Series
    { model: 'Zero 40 5G', ram: '12 GB', refreshRate: '144Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Zero 30 5G', ram: '12 GB', refreshRate: '144Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Zero 30', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Zero Ultra', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 12' },
    { model: 'Zero X Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 11' },
    { model: 'Zero 8', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.85"', gyroscope: true, os: 'Android 10' },
    { model: 'Zero 6', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.18"', gyroscope: true, os: 'Android 8' },
    // Note Series
    { model: 'Note 40 Pro+ 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Note 40 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Note 40', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Note 30 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 13' },
    { model: 'Note 30', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Note 12 Pro', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 12' },
    { model: 'Note 12 VIP', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 12' },
    { model: 'Note 12', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 12' },
    { model: 'Note 11 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.95"', gyroscope: true, os: 'Android 11' },
    { model: 'Note 11s', ram: '6 GB', refreshRate: '120Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.95"', gyroscope: true, os: 'Android 11' },
    { model: 'Note 10 Pro', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.95"', gyroscope: true, os: 'Android 11' },
    { model: 'Note 8', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.95"', gyroscope: true, os: 'Android 10' },
    { model: 'Note 7', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.95"', gyroscope: true, os: 'Android 10' },
    { model: 'Note 5', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'FHD', screenSize: '6.0"', gyroscope: true, os: 'Android 8' },
    // Hot Series
    { model: 'Hot 50 Pro+', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Hot 50 5G', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'HD+', screenSize: '6.7"', gyroscope: true, os: 'Android 14' },
    { model: 'Hot 50i', ram: '4 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'HD+', screenSize: '6.7"', gyroscope: false, os: 'Android 14' },
    { model: 'Hot 45', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.75"', gyroscope: true, os: 'Android 14' },
    { model: 'Hot 40 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Hot 40', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Hot 40i', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: false, os: 'Android 13' },
    { model: 'Hot 30', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '270Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Hot 30i', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: false, os: 'Android 12' },
    { model: 'Hot 30 Play', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 13' },
    { model: 'Hot 20 5G', ram: '4 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.6"', gyroscope: true, os: 'Android 12' },
    { model: 'Hot 20 Play', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 12' },
    { model: 'Hot 20', ram: '6 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.6"', gyroscope: true, os: 'Android 12' },
    { model: 'Hot 12 Play', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 12' },
    { model: 'Hot 12', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 11' },
    { model: 'Hot 11s NFC', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 11' },
    { model: 'Hot 11', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.6"', gyroscope: true, os: 'Android 11' },
    { model: 'Hot 10 Play', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 10' },
    { model: 'Hot 10', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.78"', gyroscope: false, os: 'Android 10' },
    { model: 'Hot 9 Pro', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: true, os: 'Android 10' },
    { model: 'Hot 9', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 10' },
    { model: 'Hot 8', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.52"', gyroscope: false, os: 'Android 9' },
    { model: 'Hot 7 Pro', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'HD+', screenSize: '6.2"', gyroscope: false, os: 'Android 9' },
    // Smart Series
    { model: 'Smart 8 Pro', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'Smart 8 HD', ram: '3 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'Smart 8', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'Smart 7 HD', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'Smart 7', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'Smart 6 HD', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 11' },
    { model: 'Smart 6 Plus', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 11' },
    { model: 'Smart 6', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 11' },
    { model: 'Smart 5 Pro', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.52"', gyroscope: false, os: 'Android 10' },
    { model: 'Smart 5', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 10' },
    { model: 'Smart 4 Plus', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 10' }
  ],
  'TECNO': [
    // Phantom Series
    { model: 'Phantom V Fold2', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: '2K+', screenSize: '7.85"', gyroscope: true, os: 'Android 14' },
    { model: 'Phantom V Flip2', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.9"', gyroscope: true, os: 'Android 14' },
    { model: 'Phantom V Fold', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: '2K+', screenSize: '7.85"', gyroscope: true, os: 'Android 13' },
    { model: 'Phantom V Flip', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.9"', gyroscope: true, os: 'Android 13' },
    { model: 'Phantom X2 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 12' },
    { model: 'Phantom X2', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 12' },
    { model: 'Phantom X', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 11' },
    // Camon Series
    { model: 'Camon 30 Premier', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: '1.5K', screenSize: '6.77"', gyroscope: true, os: 'Android 14' },
    { model: 'Camon 30 Pro 5G', ram: '12 GB', refreshRate: '144Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Camon 30 5G', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Camon 30', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Camon 20 Premier', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 13' },
    { model: 'Camon 20 Pro 5G', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 13' },
    { model: 'Camon 20', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 13' },
    { model: 'Camon 19 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 12' },
    { model: 'Camon 19 Neo', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 12' },
    { model: 'Camon 18 Premier', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 11' },
    { model: 'Camon 18P', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 11' },
    { model: 'Camon 17 Pro', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 11' },
    { model: 'Camon 17', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: true, os: 'Android 11' },
    { model: 'Camon 16 Premier', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.9"', gyroscope: true, os: 'Android 10' },
    { model: 'Camon 15 Pro', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.53"', gyroscope: true, os: 'Android 10' },
    { model: 'Camon 12 Pro', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.35"', gyroscope: true, os: 'Android 9' },
    // Pova Series
    { model: 'Pova 6 Pro 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '480Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Pova 6 Neo', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Pova 5 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Pova 5', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Pova 4 Pro', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.66"', gyroscope: true, os: 'Android 12' },
    { model: 'Pova Neo 3', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: true, os: 'Android 13' },
    { model: 'Pova Neo 2', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: true, os: 'Android 12' },
    // Spark Series
    { model: 'Spark 30 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Spark 30', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Spark 20 Pro+', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Spark 20 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Spark 20', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: true, os: 'Android 13' },
    { model: 'Spark 20C', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '185Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'Spark 10 Pro', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '270Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 13' },
    { model: 'Spark 10', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'Spark 9 Pro', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.6"', gyroscope: true, os: 'Android 12' },
    { model: 'Spark 9T', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'Spark 8 Pro', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 11' },
    { model: 'Spark 8C', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 11' },
    { model: 'Spark 7 Pro', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 11' },
    { model: 'Spark 7', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.5"', gyroscope: false, os: 'Android 11' },
    { model: 'Spark Go 2024', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'Spark Go 2023', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: false, os: 'Android 12' },
    { model: 'Spark Go (2021)', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.52"', gyroscope: false, os: 'Android 10' },
    { model: 'Spark 6', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.8"', gyroscope: true, os: 'Android 10' },
    { model: 'Spark 5 Pro', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 10' },
    { model: 'Spark 4', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.52"', gyroscope: false, os: 'Android 9' },
    // Pop Series
    { model: 'Pop 9', ram: '4 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'HD+', screenSize: '6.67"', gyroscope: false, os: 'Android 14' },
    { model: 'Pop 8', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'Pop 7 Pro', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: false, os: 'Android 12' },
    { model: 'Pop 7', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'Pop 6 Pro', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: false, os: 'Android 12' },
    { model: 'Pop 6', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.1"', gyroscope: false, os: 'Android 11' },
    { model: 'Pop 5 LTE', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.52"', gyroscope: false, os: 'Android 11' },
    { model: 'Pop 5', ram: '1 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.1"', gyroscope: false, os: 'Android 10' },
    { model: 'Pop 4 Pro', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '60Hz', resolution: 'HD+', screenSize: '6.52"', gyroscope: false, os: 'Android 10' }
  ],
  'Xiaomi': [
    { model: 'Xiaomi 14 Ultra', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.73"', gyroscope: true, os: 'Android 14' },
    { model: 'Xiaomi 13 Ultra', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.73"', gyroscope: true, os: 'Android 13' },
    { model: 'Xiaomi 12T Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '480Hz', resolution: '1.5K', screenSize: '6.67"', gyroscope: true, os: 'Android 12' }
  ],
  'Redmi': [
    { model: 'Redmi Note 13 Pro+ 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: '1.5K', screenSize: '6.67"', gyroscope: true, os: 'Android 13' },
    { model: 'Redmi Note 12 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 12' },
    { model: 'Redmi Note 11 Pro', ram: '6 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 11' },
    { model: 'Redmi 13C', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.74"', gyroscope: false, os: 'Android 13' },
    { model: 'Redmi 12', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.79"', gyroscope: true, os: 'Android 13' },
    { model: 'Redmi 10C', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.71"', gyroscope: false, os: 'Android 11' },
    { model: 'Redmi 9T', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.53"', gyroscope: true, os: 'Android 10' },
    { model: 'Redmi 8', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.22"', gyroscope: false, os: 'Android 9' }
  ],
  'POCO': [
    { model: 'POCO F6 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '480Hz', resolution: 'WQHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 14' },
    { model: 'POCO X6 Pro 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '480Hz', resolution: '1.5K', screenSize: '6.67"', gyroscope: true, os: 'Android 14' },
    { model: 'POCO X5 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 13' },
    { model: 'POCO M6 Pro', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 14' },
    { model: 'POCO C65', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.74"', gyroscope: false, os: 'Android 13' }
  ],
  'Google Pixel': [
    { model: 'Pixel 9 Pro XL', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 14' },
    { model: 'Pixel 8 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 14' },
    { model: 'Pixel 7 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 13' },
    { model: 'Pixel 6a', ram: '6 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.1"', gyroscope: true, os: 'Android 12' }
  ],
  'Huawei': [
    { model: 'Pura 70 Ultra', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '300Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'HarmonyOS 4.2' },
    { model: 'Mate 60 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '300Hz', resolution: 'FHD+', screenSize: '6.82"', gyroscope: true, os: 'HarmonyOS 4.0' },
    { model: 'Nova 12s', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '300Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'EMUI 14' }
  ],
  'Honor': [
    { model: 'Magic6 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 14' },
    { model: 'Honor 200 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: '1.5K', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Honor 90', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 13' },
    { model: 'Honor X8b', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 13' }
  ],
  'Oppo': [
    { model: 'Find X7 Ultra', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'QHD+', screenSize: '6.82"', gyroscope: true, os: 'Android 14' },
    { model: 'Reno11 Pro 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 14' },
    { model: 'Oppo A78', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.4"', gyroscope: true, os: 'Android 13' },
    { model: 'Oppo A18', ram: '4 GB', refreshRate: '90Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: false, os: 'Android 13' }
  ],
  'Vivo': [
    { model: 'X100 Pro', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '300Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'V30 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '300Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'Y28 5G', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: true, os: 'Android 13' },
    { model: 'Y02t', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.51"', gyroscope: false, os: 'Android 13' }
  ],
  'Realme': [
    { model: 'GT 6', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: '12 Pro+ 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 14' },
    { model: 'C67', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.72"', gyroscope: true, os: 'Android 14' },
    { model: 'C53', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'FHD+', screenSize: '6.74"', gyroscope: true, os: 'Android 13' },
    { model: 'C30', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.5"', gyroscope: false, os: 'Android 11' }
  ],
  'OnePlus': [
    { model: 'OnePlus 12', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '360Hz', resolution: 'QHD+', screenSize: '6.82"', gyroscope: true, os: 'Android 14' },
    { model: 'OnePlus Nord 4', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.74"', gyroscope: true, os: 'Android 14' },
    { model: 'Nord CE 4 Lite', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 14' }
  ],
  'Nothing': [
    { model: 'Phone (2)', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 13' },
    { model: 'Phone (2a)', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.7"', gyroscope: true, os: 'Android 14' }
  ],
  'itel': [
    { model: 'S24', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'S23+', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'S23', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'P55+', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'P55 5G', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: true, os: 'Android 13' },
    { model: 'P55', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'P40', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'P38 Pro', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.82"', gyroscope: false, os: 'Android 11' },
    { model: 'A70', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 13' },
    { model: 'A60s', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'A60', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 12' },
    { model: 'A58', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 11' },
    { model: 'A56', ram: '1 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.0"', gyroscope: false, os: 'Android 9' },
    { model: 'Vision 3', ram: '3 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.6"', gyroscope: false, os: 'Android 11' },
    { model: 'Vision 1 Pro', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.5"', gyroscope: false, os: 'Android 10' }
  ],
  'Nokia': [
    { model: 'G42 5G', ram: '6 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: true, os: 'Android 13' },
    { model: 'C32', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.52"', gyroscope: false, os: 'Android 13' },
    { model: 'C12', ram: '2 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'HD+', screenSize: '6.3"', gyroscope: false, os: 'Android 12' }
  ],
  'Motorola': [
    { model: 'Edge 50 Ultra', ram: '16 GB', refreshRate: '144Hz', touchSamplingRate: '360Hz', resolution: '1.5K', screenSize: '6.7"', gyroscope: true, os: 'Android 14' },
    { model: 'Moto G85 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 14' },
    { model: 'Moto G24 Power', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.56"', gyroscope: true, os: 'Android 14' }
  ],
  'Sony': [
    { model: 'Xperia 1 VI', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.5"', gyroscope: true, os: 'Android 14' },
    { model: 'Xperia 10 VI', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.1"', gyroscope: true, os: 'Android 14' }
  ],
  'ASUS ROG': [
    { model: 'ROG Phone 8 Pro', ram: '24 GB', refreshRate: '165Hz', touchSamplingRate: '720Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' },
    { model: 'ROG Phone 7 Ultimate', ram: '16 GB', refreshRate: '165Hz', touchSamplingRate: '720Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' }
  ],
  'Black Shark': [
    { model: 'Black Shark 5 Pro', ram: '16 GB', refreshRate: '144Hz', touchSamplingRate: '720Hz', resolution: 'FHD+', screenSize: '6.67"', gyroscope: true, os: 'Android 12' }
  ],
  'Lenovo': [
    { model: 'Legion Y90', ram: '16 GB', refreshRate: '144Hz', touchSamplingRate: '720Hz', resolution: 'FHD+', screenSize: '6.92"', gyroscope: true, os: 'Android 12' }
  ],
  'LG': [
    { model: 'Velvet 5G', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 10' },
    { model: 'V60 ThinQ 5G', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 10' }
  ],
  'HTC': [
    { model: 'U24 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 14' }
  ],
  'ZTE': [
    { model: 'Nubia RedMagic 9 Pro', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '960Hz', resolution: 'FHD+', screenSize: '6.8"', gyroscope: true, os: 'Android 14' }
  ],
  'Meizu': [
    { model: 'Meizu 21 Pro', ram: '16 GB', refreshRate: '120Hz', touchSamplingRate: '300Hz', resolution: '2K+', screenSize: '6.79"', gyroscope: true, os: 'Flyme 10.5' }
  ],
  'Sharp': [
    { model: 'Aquos R9', ram: '12 GB', refreshRate: '240Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.5"', gyroscope: true, os: 'Android 14' }
  ],
  'Lava': [
    { model: 'Agni 2 5G', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' },
    { model: 'Yuva 3 Pro', ram: '8 GB', refreshRate: '90Hz', touchSamplingRate: '180Hz', resolution: 'HD+', screenSize: '6.5"', gyroscope: false, os: 'Android 13' }
  ],
  'Micromax': [
    { model: 'In Note 2', ram: '4 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.43"', gyroscope: true, os: 'Android 11' }
  ],
  'Blu': [
    { model: 'Bold N3', ram: '8 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' }
  ],
  'Cubot': [
    { model: 'KingKong Star 2 5G', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.72"', gyroscope: true, os: 'Android 14' }
  ],
  'Doogee': [
    { model: 'V30 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.58"', gyroscope: true, os: 'Android 13' }
  ],
  'Blackview': [
    { model: 'BL9000 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 14' }
  ],
  'Oukitel': [
    { model: 'WP30 Pro', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' }
  ],
  'Ulefone': [
    { model: 'Armor 26 Ultra', ram: '12 GB', refreshRate: '120Hz', touchSamplingRate: '240Hz', resolution: 'FHD+', screenSize: '6.78"', gyroscope: true, os: 'Android 13' }
  ],
  'Umidigi': [
    { model: 'Bison 2 Pro', ram: '8 GB', refreshRate: '60Hz', touchSamplingRate: '120Hz', resolution: 'FHD+', screenSize: '6.5"', gyroscope: true, os: 'Android 12' }
  ]
};

export function detectProcessor(brand: string, model: string): string {
  const b = brand.toLowerCase();
  const m = model.toLowerCase();

  if (b.includes('apple') || b.includes('iphone')) {
    if (m.includes('16 pro')) return 'Apple A18 Pro';
    if (m.includes('16')) return 'Apple A18';
    if (m.includes('15 pro')) return 'Apple A17 Pro';
    if (m.includes('15')) return 'Apple A16 Bionic';
    if (m.includes('14 pro')) return 'Apple A16 Bionic';
    if (m.includes('14')) return 'Apple A15 Bionic';
    if (m.includes('13')) return 'Apple A15 Bionic';
    if (m.includes('12')) return 'Apple A14 Bionic';
    if (m.includes('11')) return 'Apple A13 Bionic';
    if (m.includes('xs') || m.includes('xr')) return 'Apple A12 Bionic';
    if (m.includes('x') || m.includes('8')) return 'Apple A11 Bionic';
    if (m.includes('7')) return 'Apple A10 Fusion';
    if (m.includes('6s')) return 'Apple A9';
    if (m.includes('6')) return 'Apple A8';
    return 'Apple Silicon';
  }

  if (b.includes('samsung')) {
    if (m.includes('s24 ultra')) return 'Snapdragon 8 Gen 3';
    if (m.includes('s24')) return 'Exynos 2400 / Snapdragon 8 Gen 3';
    if (m.includes('s23 ultra') || m.includes('s23')) return 'Snapdragon 8 Gen 2';
    if (m.includes('s22')) return 'Snapdragon 8 Gen 1 / Exynos 2200';
    if (m.includes('s21') || m.includes('s20 fe')) return 'Snapdragon 888 / Exynos 2100';
    if (m.includes('a55')) return 'Exynos 1480';
    if (m.includes('a35')) return 'Exynos 1380';
    if (m.includes('a15')) return 'MediaTek Helio G99';
    if (m.includes('a05')) return 'Snapdragon 680';
    if (m.includes('a04')) return 'MediaTek Helio P35';
    if (m.includes('m54')) return 'Exynos 1380';
    return 'Exynos Octa';
  }

  if (b.includes('infinix')) {
    if (m.includes('gt 20 pro')) return 'MediaTek Dimensity 8200 Ultimate';
    if (m.includes('gt 10 pro')) return 'MediaTek Dimensity 8050';
    if (m.includes('zero 40')) return 'MediaTek Dimensity 8200 Ultimate';
    if (m.includes('zero 30 5g')) return 'MediaTek Dimensity 8020';
    if (m.includes('zero 30')) return 'MediaTek Helio G99';
    if (m.includes('zero ultra')) return 'MediaTek Dimensity 920';
    if (m.includes('zero x pro')) return 'MediaTek Helio G95';
    if (m.includes('zero 8')) return 'MediaTek Helio G90T';
    if (m.includes('note 40 pro+')) return 'MediaTek Dimensity 7020';
    if (m.includes('note 40 pro')) return 'MediaTek Dimensity 7020';
    if (m.includes('note 40')) return 'MediaTek Helio G99';
    if (m.includes('note 30 pro')) return 'MediaTek Helio G99';
    if (m.includes('note 30')) return 'MediaTek Helio G99';
    if (m.includes('note 12 pro')) return 'MediaTek Helio G99';
    if (m.includes('note 12 vip')) return 'MediaTek Helio G96';
    if (m.includes('note 12')) return 'MediaTek Helio G96';
    if (m.includes('note 11s')) return 'MediaTek Helio G96';
    if (m.includes('note 11')) return 'MediaTek Helio G96';
    if (m.includes('note 10 pro')) return 'MediaTek Helio G95';
    if (m.includes('note 8')) return 'MediaTek Helio G80';
    if (m.includes('note 7')) return 'MediaTek Helio G70';
    if (m.includes('note 5')) return 'MediaTek Helio P23';
    if (m.includes('hot 50 pro+')) return 'MediaTek Helio G100';
    if (m.includes('hot 50 5g')) return 'MediaTek Dimensity 6300';
    if (m.includes('hot 50i')) return 'MediaTek Helio G81 Ultra';
    if (m.includes('hot 50')) return 'MediaTek Dimensity 6300';
    if (m.includes('hot 40 pro')) return 'MediaTek Helio G99';
    if (m.includes('hot 40i')) return 'Unisoc T606';
    if (m.includes('hot 40')) return 'MediaTek Helio G88';
    if (m.includes('hot 30i')) return 'Unisoc T606';
    if (m.includes('hot 30 play')) return 'MediaTek Helio G37';
    if (m.includes('hot 30')) return 'MediaTek Helio G88';
    if (m.includes('hot 20 5g')) return 'MediaTek Dimensity 810';
    if (m.includes('hot 20 play')) return 'MediaTek Helio G37';
    if (m.includes('hot 20')) return 'MediaTek Helio G85';
    if (m.includes('hot 12 play')) return 'Unisoc T610';
    if (m.includes('hot 12')) return 'MediaTek Helio G85';
    if (m.includes('hot 11s')) return 'MediaTek Helio G88';
    if (m.includes('hot 11')) return 'MediaTek Helio G88';
    if (m.includes('hot 10 play')) return 'MediaTek Helio G35';
    if (m.includes('hot 10')) return 'MediaTek Helio G80';
    if (m.includes('hot 9')) return 'MediaTek Helio A25';
    if (m.includes('hot 8')) return 'MediaTek Helio P22';
    if (m.includes('smart 8 pro')) return 'MediaTek Helio G36';
    if (m.includes('smart 8 hd')) return 'Unisoc T606';
    if (m.includes('smart 8')) return 'Unisoc T606';
    if (m.includes('smart 7')) return 'Unisoc SC9863A';
    if (m.includes('smart 6 plus')) return 'Unisoc SC9863A';
    if (m.includes('smart 6')) return 'Unisoc SC9863A';
    if (m.includes('smart 5 pro')) return 'Unisoc SC9863A';
    if (m.includes('smart 5')) return 'MediaTek Helio A25';
    if (m.includes('smart 4 plus')) return 'MediaTek Helio A25';
    return 'MediaTek Helio';
  }

  if (b.includes('tecno')) {
    if (m.includes('phantom v fold2')) return 'MediaTek Dimensity 9000+';
    if (m.includes('phantom v fold')) return 'MediaTek Dimensity 9000+';
    if (m.includes('phantom v flip2')) return 'MediaTek Dimensity 8020';
    if (m.includes('phantom v flip')) return 'MediaTek Dimensity 8050';
    if (m.includes('phantom x2 pro')) return 'MediaTek Dimensity 9000';
    if (m.includes('phantom x2')) return 'MediaTek Dimensity 9000';
    if (m.includes('phantom x')) return 'MediaTek Helio G95';
    if (m.includes('camon 30 premier')) return 'MediaTek Dimensity 8200 Ultimate';
    if (m.includes('camon 30 pro')) return 'MediaTek Dimensity 8200 Ultimate';
    if (m.includes('camon 30 5g')) return 'MediaTek Dimensity 7020';
    if (m.includes('camon 30')) return 'MediaTek Helio G99';
    if (m.includes('camon 20 premier')) return 'MediaTek Dimensity 8050';
    if (m.includes('camon 20 pro 5g')) return 'MediaTek Dimensity 8050';
    if (m.includes('camon 20 pro')) return 'MediaTek Dimensity 8050';
    if (m.includes('camon 20')) return 'MediaTek Helio G85';
    if (m.includes('camon 19 pro')) return 'MediaTek Helio G96';
    if (m.includes('camon 19 neo')) return 'MediaTek Helio G85';
    if (m.includes('camon 18 premier')) return 'MediaTek Helio G96';
    if (m.includes('camon 18p')) return 'MediaTek Helio G96';
    if (m.includes('camon 18')) return 'MediaTek Helio G96';
    if (m.includes('camon 17 pro')) return 'MediaTek Helio G95';
    if (m.includes('camon 17')) return 'MediaTek Helio G85';
    if (m.includes('camon 16 premier')) return 'MediaTek Helio G90T';
    if (m.includes('camon 15 pro')) return 'MediaTek Helio P35';
    if (m.includes('camon 12 pro')) return 'MediaTek Helio P22';
    if (m.includes('pova 6 pro')) return 'MediaTek Dimensity 6080';
    if (m.includes('pova 6 neo')) return 'MediaTek Helio G99 Ultimate';
    if (m.includes('pova 5 pro')) return 'MediaTek Dimensity 6080';
    if (m.includes('pova 5')) return 'MediaTek Helio G99';
    if (m.includes('pova 4 pro')) return 'MediaTek Helio G99';
    if (m.includes('pova neo 3')) return 'MediaTek Helio G85';
    if (m.includes('pova neo 2')) return 'MediaTek Helio G85';
    if (m.includes('spark 30 pro')) return 'MediaTek Helio G100';
    if (m.includes('spark 30')) return 'MediaTek Helio G91 Ultra';
    if (m.includes('spark 20 pro+')) return 'MediaTek Helio G99';
    if (m.includes('spark 20 pro')) return 'MediaTek Helio G99';
    if (m.includes('spark 20c')) return 'MediaTek Helio G36';
    if (m.includes('spark 20')) return 'MediaTek Helio G85';
    if (m.includes('spark 10 pro')) return 'MediaTek Helio G88';
    if (m.includes('spark 10')) return 'MediaTek Helio G37';
    if (m.includes('spark 9 pro')) return 'MediaTek Helio G85';
    if (m.includes('spark 9t')) return 'MediaTek Helio G37';
    if (m.includes('spark 8 pro')) return 'MediaTek Helio G85';
    if (m.includes('spark 8c')) return 'Unisoc T606';
    if (m.includes('spark 7 pro')) return 'MediaTek Helio G80';
    if (m.includes('spark 7')) return 'MediaTek Helio A25';
    if (m.includes('spark go 2024')) return 'Unisoc T606';
    if (m.includes('spark go 2023')) return 'MediaTek Helio A22';
    if (m.includes('spark go (2021)')) return 'MediaTek Helio A20';
    if (m.includes('spark 6')) return 'MediaTek Helio G70';
    if (m.includes('spark 5 pro')) return 'MediaTek Helio A25';
    if (m.includes('pop 9')) return 'Unisoc T606';
    if (m.includes('pop 8')) return 'Unisoc T606';
    if (m.includes('pop 7 pro')) return 'MediaTek Helio A22';
    if (m.includes('pop 7')) return 'Unisoc SC9863A';
    if (m.includes('pop 6 pro')) return 'MediaTek Helio A22';
    if (m.includes('pop 6')) return 'MediaTek Helio A22';
    if (m.includes('pop 5 lte')) return 'Unisoc SC9863A';
    if (m.includes('pop 5')) return 'MediaTek MT6580';
    if (m.includes('pop 4 pro')) return 'MediaTek MT6761D';
    return 'MediaTek Dimensity';
  }

  if (b.includes('itel')) {
    if (m.includes('s24')) return 'MediaTek Helio G91 Ultra';
    if (m.includes('s23+')) return 'Unisoc T616';
    if (m.includes('s23')) return 'Unisoc T606';
    if (m.includes('p55 5g')) return 'MediaTek Dimensity 6080';
    if (m.includes('p55+')) return 'Unisoc T606';
    if (m.includes('p55')) return 'Unisoc T606';
    if (m.includes('p40')) return 'Unisoc SC9863A';
    if (m.includes('a70')) return 'Unisoc T603';
    if (m.includes('a60s') || m.includes('a60')) return 'Unisoc SC9863A';
    return 'Unisoc / MediaTek Processor';
  }

  if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) {
    if (m.includes('14 ultra') || m.includes('f6 pro')) return 'Snapdragon 8 Gen 3';
    if (m.includes('f6') || m.includes('x6 pro')) return 'MediaTek Dimensity 8300 Ultra';
    if (m.includes('x6') || m.includes('m6 pro')) return 'Snapdragon 7s Gen 2';
    if (m.includes('13t pro')) return 'MediaTek Dimensity 9200+';
    if (m.includes('13t') || m.includes('redmi note 13 pro+')) return 'MediaTek Dimensity 7200 Ultra';
    if (m.includes('redmi note 13 pro')) return 'MediaTek Helio G99';
    if (m.includes('redmi note 13')) return 'MediaTek Dimensity 6080';
    if (m.includes('redmi note 12 pro') || m.includes('poco x5 pro')) return 'Snapdragon 778G';
    if (m.includes('redmi note 12') || m.includes('poco x5')) return 'Snapdragon 4 Gen 1';
    if (m.includes('redmi 12') || m.includes('redmi 13')) return 'MediaTek Helio G88';
    if (m.includes('poco c65')) return 'MediaTek Helio G85';
    return 'Snapdragon / MediaTek';
  }

  if (b.includes('google pixel')) {
    if (m.includes('9')) return 'Google Tensor G4';
    if (m.includes('8')) return 'Google Tensor G3';
    if (m.includes('7')) return 'Google Tensor G2';
    if (m.includes('6')) return 'Google Tensor';
    return 'Google Tensor';
  }

  if (b.includes('oneplus')) {
    if (m.includes('12')) return 'Snapdragon 8 Gen 3';
    if (m.includes('11')) return 'Snapdragon 8 Gen 2';
    if (m.includes('10')) return 'Snapdragon 8 Gen 1';
    if (m.includes('nord')) return 'MediaTek Dimensity 9000';
    return 'Snapdragon';
  }

  if (b.includes('asus') || b.includes('rog')) {
    if (m.includes('rog phone 8')) return 'Snapdragon 8 Gen 3';
    if (m.includes('rog phone 7')) return 'Snapdragon 8 Gen 2';
    return 'Snapdragon';
  }

  // Fallbacks based on common keyword matching in model
  if (m.includes('ultra') || m.includes('pro max') || m.includes('flagship')) {
    return 'Snapdragon 8 Gen 3';
  }
  if (m.includes('pro') || m.includes('plus')) {
    return 'Snapdragon 8 Gen 2';
  }
  if (m.includes('lite') || m.includes('play')) {
    return 'MediaTek Helio G85';
  }

  return 'Octa-Core Processor';
}
