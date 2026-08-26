/**
 * CATÁLOGO DE ICONOS
 *
 * Cada categoría lleva asociada una paleta duotono (relleno + trazo) que se
 * aplica automáticamente cuando el icono usa `duo=auto`. Así el explorador se
 * ve multicolor sin necesidad de colorear icono por icono.
 *
 * Formato compacto:  NombreLucide: 'palabras clave en español para buscar'
 * Las palabras del propio nombre del icono se añaden automáticamente.
 */

export const DUO_PALETTES = {
  blue:   { fill: '#38BDF8', stroke: '#0C4A6E', label: 'Cielo' },
  indigo: { fill: '#818CF8', stroke: '#312E81', label: 'Índigo' },
  violet: { fill: '#A855F7', stroke: '#4C1D95', label: 'Violeta' },
  pink:   { fill: '#F472B6', stroke: '#831843', label: 'Rosa' },
  rose:   { fill: '#FB7185', stroke: '#881337', label: 'Coral' },
  red:    { fill: '#F87171', stroke: '#7F1D1D', label: 'Rojo' },
  orange: { fill: '#FB923C', stroke: '#7C2D12', label: 'Naranja' },
  amber:  { fill: '#FBBF24', stroke: '#78350F', label: 'Ámbar' },
  lime:   { fill: '#A3E635', stroke: '#3F6212', label: 'Lima' },
  green:  { fill: '#34D399', stroke: '#065F46', label: 'Esmeralda' },
  teal:   { fill: '#2DD4BF', stroke: '#115E59', label: 'Turquesa' },
  cyan:   { fill: '#22D3EE', stroke: '#155E75', label: 'Cian' },
  slate:  { fill: '#94A3B8', stroke: '#1E293B', label: 'Grafito' },
  brown:  { fill: '#D6A57C', stroke: '#6B3F1D', label: 'Tierra' }
};

const CATALOG = [
  { category: 'Seguridad', palette: 'blue', icons: {
    Shield: 'seguridad seguro proteccion protegido escudo',
    ShieldCheck: 'verificado validado protegido aprobado',
    ShieldAlert: 'riesgo amenaza vulnerabilidad aviso',
    ShieldOff: 'desprotegido sin proteccion desactivado',
    Lock: 'candado bloqueado privado cerrado',
    LockOpen: 'desbloqueado abierto acceso libre',
    Key: 'llave clave acceso credencial',
    KeyRound: 'llave redonda contraseña password',
    Fingerprint: 'huella biometria identidad',
    ScanFace: 'reconocimiento facial cara biometria',
    EyeOff: 'oculto invisible privacidad',
    UserCheck: 'usuario verificado autenticado'
  }},

  { category: 'Alertas', palette: 'amber', icons: {
    AlertTriangle: 'advertencia atencion precaucion alerta cuidado peligro',
    AlertCircle: 'error fallo problema critico',
    AlertOctagon: 'detener grave bloqueante',
    Info: 'informacion nota detalles',
    HelpCircle: 'ayuda duda pregunta soporte',
    Lightbulb: 'idea tip sugerencia truco innovacion',
    Bell: 'notificacion aviso campana recordatorio',
    BellRing: 'notificacion activa sonando urgente',
    BellOff: 'silenciado sin notificaciones',
    Siren: 'emergencia alarma urgencia',
    Megaphone: 'anuncio aviso comunicado altavoz',
    TriangleAlert: 'advertencia triangulo riesgo'
  }},

  { category: 'Estado', palette: 'green', icons: {
    CheckCircle2: 'exito completado correcto logro hecho ok',
    Check: 'listo marcado confirmado',
    CheckCheck: 'doble confirmacion todo listo',
    XCircle: 'cancelado rechazado fallido',
    X: 'cerrar quitar eliminar',
    CircleDot: 'en curso activo seleccionado',
    Loader: 'cargando procesando espera',
    RefreshCw: 'actualizar recargar sincronizar',
    Hourglass: 'pendiente esperando tiempo',
    Ban: 'prohibido bloqueado no permitido',
    ThumbsUp: 'aprobado me gusta positivo',
    ThumbsDown: 'rechazado negativo desaprobado'
  }},

  { category: 'Progreso', palette: 'teal', icons: {
    TrendingUp: 'crecimiento subida mejora aumento',
    TrendingDown: 'caida bajada descenso perdida',
    Gauge: 'medidor rendimiento velocidad indicador',
    Activity: 'actividad pulso monitoreo latido',
    Milestone: 'hito etapa punto de control',
    Flag: 'bandera marca objetivo señal',
    ListChecks: 'checklist tareas pendientes',
    CircleCheckBig: 'completado grande exito',
    Percent: 'porcentaje proporcion descuento',
    Timer: 'cronometro cuenta atras',
    Rocket: 'cohete lanzamiento despegue inicio startup',
    Sparkles: 'magia ia inteligencia auto brillo destello'
  }},

  { category: 'Tecnología', palette: 'indigo', icons: {
    Cpu: 'procesador sistema hardware chip',
    MemoryStick: 'memoria ram modulo',
    HardDrive: 'disco duro almacenamiento unidad',
    Microchip: 'chip circuito integrado',
    CircuitBoard: 'placa circuito electronica',
    Bot: 'robot bot automatizacion asistente',
    BrainCircuit: 'ia inteligencia artificial red neuronal',
    Binary: 'binario datos bits',
    Zap: 'rapido energia rayo instantaneo',
    Radio: 'señal transmision emision',
    Antenna: 'antena cobertura señal',
    Satellite: 'satelite comunicacion orbita'
  }},

  { category: 'Desarrollo', palette: 'violet', icons: {
    Code: 'codigo desarrollo programacion script funcion',
    Code2: 'codigo fuente etiquetas',
    FileCode: 'archivo de codigo fuente script',
    Terminal: 'consola bash shell comando cli',
    SquareTerminal: 'terminal ventana comandos',
    Bug: 'error fallo depuracion insecto',
    GitBranch: 'rama version branch repositorio',
    GitCommit: 'commit cambio revision',
    GitMerge: 'fusion merge integracion',
    GitPullRequest: 'pull request revision propuesta',
    Braces: 'llaves json objeto',
    Blocks: 'modulos bloques componentes'
  }},

  { category: 'Datos', palette: 'cyan', icons: {
    Database: 'base de datos sql bd almacenamiento tabla',
    DatabaseBackup: 'respaldo copia seguridad backup',
    Table: 'tabla filas columnas',
    Table2: 'cuadricula datos hoja',
    Columns3: 'columnas distribucion',
    Rows3: 'filas registros',
    Filter: 'filtro criterio seleccion',
    ArrowDownUp: 'ordenar clasificar',
    Sigma: 'suma total agregado',
    Calculator: 'calculadora calculo operacion',
    FileSpreadsheet: 'hoja de calculo excel csv',
    Boxes: 'conjuntos coleccion datos'
  }},

  { category: 'Nube y Red', palette: 'blue', icons: {
    Cloud: 'nube cloud remoto',
    CloudUpload: 'subir a la nube cargar',
    CloudDownload: 'descargar de la nube bajar',
    Server: 'servidor backend host',
    Network: 'red topologia nodos',
    Globe: 'internet web mundo global',
    Wifi: 'inalambrico conexion señal',
    WifiOff: 'sin conexion desconectado',
    Link: 'enlace url vinculo',
    Link2: 'cadena conexion referencia',
    Share2: 'compartir difundir enviar',
    Rss: 'suscripcion feed noticias'
  }},

  { category: 'Dispositivos', palette: 'slate', icons: {
    Monitor: 'pantalla computadora escritorio',
    Laptop: 'portatil ordenador notebook',
    Smartphone: 'movil celular telefono',
    Tablet: 'tableta ipad dispositivo',
    Watch: 'reloj inteligente smartwatch',
    Keyboard: 'teclado escribir teclas',
    Mouse: 'raton puntero',
    Printer: 'impresora imprimir',
    Usb: 'puerto usb conector',
    Plug: 'enchufe conectar corriente',
    BatteryFull: 'bateria carga completa energia',
    Power: 'encender apagar boton'
  }},

  { category: 'Interfaz', palette: 'slate', icons: {
    LayoutDashboard: 'panel tablero dashboard',
    LayoutGrid: 'cuadricula mosaico rejilla',
    LayoutList: 'lista vista detalle',
    Sidebar: 'barra lateral panel',
    PanelLeft: 'panel izquierdo colapsar',
    PanelRight: 'panel derecho',
    Menu: 'menu hamburguesa opciones',
    MoreHorizontal: 'mas opciones puntos',
    Settings: 'configuracion ajustes opciones preferencias',
    Sliders: 'controles deslizantes parametros',
    ToggleLeft: 'interruptor apagado',
    Maximize2: 'maximizar expandir pantalla completa'
  }},

  { category: 'Navegación', palette: 'indigo', icons: {
    ArrowRight: 'derecha siguiente avanzar',
    ArrowLeft: 'izquierda anterior volver',
    ArrowUp: 'arriba subir ascender',
    ArrowDown: 'abajo bajar descender',
    ChevronRight: 'expandir siguiente flecha',
    ChevronDown: 'desplegar abrir',
    CornerDownRight: 'sangria subnivel derivado',
    Undo2: 'deshacer atras revertir',
    Redo2: 'rehacer adelante repetir',
    ExternalLink: 'abrir en otra ventana externo',
    Move: 'mover arrastrar desplazar',
    Navigation: 'direccion rumbo brujula'
  }},

  { category: 'Archivos', palette: 'amber', icons: {
    FileText: 'archivo documento texto reporte',
    File: 'fichero generico',
    FilePlus: 'nuevo archivo crear',
    FileCheck: 'archivo validado revisado',
    FileX: 'archivo rechazado eliminado',
    FileDown: 'descargar archivo exportar',
    FileUp: 'subir archivo importar',
    Files: 'varios archivos multiples',
    FileArchive: 'comprimido zip empaquetado',
    FileImage: 'archivo de imagen grafico',
    FileJson: 'json datos estructurados',
    Paperclip: 'adjunto clip anexo'
  }},

  { category: 'Carpetas', palette: 'amber', icons: {
    Folder: 'carpeta directorio categoria',
    FolderOpen: 'carpeta abierta explorar',
    FolderPlus: 'nueva carpeta crear',
    FolderTree: 'arbol jerarquia estructura',
    Archive: 'archivar guardar historico',
    Inbox: 'bandeja entrada recibidos',
    Package: 'paquete libreria modulo dependencia',
    Box: 'caja contenedor',
    Container: 'contenedor docker despliegue',
    Trash2: 'papelera borrar eliminar',
    Save: 'guardar disquete almacenar',
    HardDriveDownload: 'guardar en disco local'
  }},

  { category: 'Texto', palette: 'slate', icons: {
    Type: 'tipografia fuente texto',
    Heading1: 'titulo principal h1',
    Heading2: 'subtitulo h2',
    Heading3: 'apartado h3',
    Pilcrow: 'parrafo bloque',
    Bold: 'negrita fuerte destacado',
    Italic: 'cursiva enfasis',
    Underline: 'subrayado',
    Strikethrough: 'tachado',
    Quote: 'cita comillas',
    List: 'lista viñetas puntos',
    ListOrdered: 'lista numerada orden'
  }},

  { category: 'Edición', palette: 'violet', icons: {
    Pencil: 'lapiz editar escribir',
    PenLine: 'boligrafo redactar',
    Edit3: 'modificar retocar',
    Eraser: 'borrador limpiar',
    Copy: 'copiar duplicar',
    ClipboardPaste: 'pegar portapapeles',
    Scissors: 'cortar recortar tijeras',
    Replace: 'reemplazar sustituir',
    Search: 'buscar investigar lupa',
    SearchCode: 'buscar en el codigo',
    WrapText: 'ajustar texto salto',
    IndentIncrease: 'sangria aumentar'
  }},

  { category: 'Formato', palette: 'pink', icons: {
    AlignLeft: 'alinear izquierda',
    AlignCenter: 'centrar centrado',
    AlignRight: 'alinear derecha',
    AlignJustify: 'justificado bloque',
    Palette: 'paleta colores estilo',
    Paintbrush: 'pincel pintar color',
    PaintBucket: 'relleno cubo color fondo',
    Droplet: 'gota tono opacidad',
    Contrast: 'contraste claro oscuro',
    Highlighter: 'resaltador marcador',
    Ruler: 'regla medida espaciado',
    CaseSensitive: 'mayusculas minusculas'
  }},

  { category: 'Multimedia', palette: 'rose', icons: {
    Play: 'reproducir iniciar',
    Pause: 'pausa detener temporal',
    CircleStop: 'detener parar stop',
    SkipForward: 'siguiente adelantar',
    SkipBack: 'anterior retroceder',
    Film: 'pelicula video cine',
    Video: 'camara de video grabar',
    TvMinimalPlay: 'reproductor pantalla emision',
    Clapperboard: 'claqueta rodaje produccion',
    ListMusic: 'lista de reproduccion playlist',
    Repeat: 'repetir bucle',
    Shuffle: 'aleatorio mezclar'
  }},

  { category: 'Imagen', palette: 'teal', icons: {
    Image: 'imagen foto picture grafico',
    ImagePlus: 'añadir imagen insertar',
    Images: 'galeria varias imagenes',
    Camera: 'camara fotografia captura',
    Aperture: 'diafragma lente enfoque',
    Crop: 'recortar encuadre',
    ZoomIn: 'acercar ampliar zoom',
    ZoomOut: 'alejar reducir',
    Scan: 'escanear digitalizar',
    QrCode: 'codigo qr enlace',
    Frame: 'marco encuadre borde',
    Wallpaper: 'fondo de pantalla'
  }},

  { category: 'Audio', palette: 'violet', icons: {
    Music: 'musica cancion nota',
    Music2: 'melodia tema audio',
    Mic: 'microfono grabar voz',
    MicOff: 'silenciar microfono mudo',
    Volume2: 'volumen alto sonido',
    VolumeX: 'sin sonido mudo silencio',
    Headphones: 'auriculares cascos escuchar',
    Speaker: 'altavoz bocina',
    AudioLines: 'onda de sonido espectro',
    AudioWaveform: 'forma de onda audio',
    Podcast: 'podcast emision programa',
    Disc3: 'disco vinilo album'
  }},

  { category: 'Comunicación', palette: 'blue', icons: {
    Mail: 'correo email mensaje contacto',
    MailOpen: 'correo leido abierto',
    Send: 'enviar mandar',
    MessageSquare: 'mensaje chat comentario',
    MessageCircle: 'conversacion charla',
    MessagesSquare: 'hilo conversaciones',
    Phone: 'telefono llamada soporte',
    PhoneCall: 'llamada en curso',
    Voicemail: 'buzon de voz mensaje',
    AtSign: 'arroba mencion usuario',
    Reply: 'responder contestar',
    Forward: 'reenviar remitir'
  }},

  { category: 'Símbolos', palette: 'slate', icons: {
    Copyright: 'derechos de autor copyright licencia',
    Infinity: 'infinito ilimitado sin fin',
    Pi: 'pi matematicas constante',
    Omega: 'omega final griega',
    Ampersand: 'ampersand y conjuncion',
    Command: 'comando tecla atajo',
    Superscript: 'superindice exponente',
    Subscript: 'subindice nota',
    Divide: 'dividir division cociente',
    Radical: 'raiz cuadrada radical',
    Diameter: 'diametro medida circulo',
    Stamp: 'sello validacion oficial'
  }},

  { category: 'Usuarios', palette: 'cyan', icons: {
    User: 'usuario cliente persona perfil cuenta',
    Users: 'equipo comunidad grupo personas',
    UserPlus: 'añadir usuario invitar',
    UserMinus: 'quitar usuario eliminar',
    UserCog: 'administrar usuario permisos',
    UsersRound: 'grupo circulo miembros',
    Contact: 'contacto ficha agenda',
    IdCard: 'identificacion credencial carnet',
    CircleUser: 'avatar perfil redondo',
    Handshake: 'acuerdo alianza colaboracion',
    PersonStanding: 'persona figura individuo',
    Baby: 'bebe infantil niño'
  }},

  { category: 'Negocios', palette: 'green', icons: {
    Briefcase: 'maletin trabajo empresa negocio',
    Building2: 'edificio oficina corporativo',
    Target: 'meta objetivo goal hito mision',
    ChartNoAxesCombined: 'crecimiento resultados',
    Presentation: 'presentacion exposicion charla',
    Scale: 'balanza equilibrio justicia',
    Award: 'premio reconocimiento galardon',
    Trophy: 'trofeo ganador campeon',
    Crown: 'corona premium destacado',
    Lightbulb: 'idea de negocio innovacion',
    Factory: 'fabrica industria produccion',
    Signature: 'firma acuerdo contrato'
  }},

  { category: 'Finanzas', palette: 'green', icons: {
    DollarSign: 'dinero precio costo presupuesto pagos ventas finanzas',
    Euro: 'euro moneda europa',
    Wallet: 'cartera billetera saldo',
    CreditCard: 'tarjeta pago credito',
    Banknote: 'billete efectivo dinero',
    Coins: 'monedas cambio suelto',
    PiggyBank: 'ahorro hucha reserva',
    Receipt: 'recibo factura ticket',
    Landmark: 'banco institucion entidad',
    HandCoins: 'pago cobro transaccion',
    Bitcoin: 'bitcoin cripto blockchain',
    CircleDollarSign: 'importe total monetario'
  }},

  { category: 'Comercio', palette: 'orange', icons: {
    ShoppingCart: 'carrito compra pedido',
    ShoppingBag: 'bolsa compra tienda',
    Store: 'tienda comercio local',
    Tag: 'etiqueta precio marcador',
    Tags: 'etiquetas categorias',
    Barcode: 'codigo de barras producto',
    Truck: 'envio reparto entrega',
    PackageCheck: 'pedido verificado listo',
    Gift: 'regalo obsequio promocion',
    BadgePercent: 'descuento oferta rebaja',
    Ticket: 'entrada cupon boleto',
    Star: 'estrella favorito destacado top valoracion'
  }},

  { category: 'Gráficos', palette: 'indigo', icons: {
    BarChart3: 'barras grafico estadistica',
    LineChart: 'lineas tendencia evolucion',
    PieChart: 'circular porciones reparto',
    AreaChart: 'area acumulado volumen',
    ChartColumn: 'columnas comparativa',
    ChartScatter: 'dispersion correlacion',
    Radar: 'radar multidimensional',
    Waypoints: 'nodos relaciones grafo',
    ChartCandlestick: 'velas bursatil cotizacion',
    SquareActivity: 'metrica panel indicador',
    ArrowUpRight: 'al alza incremento',
    ArrowDownRight: 'a la baja decremento'
  }},

  { category: 'Tiempo', palette: 'blue', icons: {
    Calendar: 'calendario fecha evento agenda',
    CalendarDays: 'dias mes planificacion',
    CalendarCheck: 'confirmado agendado',
    CalendarClock: 'programado recordatorio',
    Clock: 'reloj hora duracion',
    AlarmClock: 'alarma despertador aviso',
    History: 'historial versiones anterior',
    CalendarRange: 'rango periodo intervalo',
    Sunrise: 'amanecer inicio del dia',
    Sunset: 'atardecer fin del dia',
    CalendarPlus: 'añadir evento nuevo',
    TimerReset: 'reiniciar contador'
  }},

  { category: 'Ubicación', palette: 'red', icons: {
    MapPin: 'ubicacion lugar posicion pin',
    Map: 'mapa plano territorio',
    Navigation2: 'direccion guia rumbo',
    Compass: 'brujula orientacion norte',
    Globe2: 'mundo planeta internacional',
    Route: 'ruta itinerario recorrido',
    LocateFixed: 'localizar gps preciso',
    Milestone: 'señal hito kilometro',
    Tent: 'campamento acampada',
    Mountain: 'montaña cumbre relieve',
    Building: 'edificio direccion sede',
    Home: 'inicio casa hogar principal'
  }},

  { category: 'Transporte', palette: 'orange', icons: {
    Car: 'coche automovil vehiculo',
    Bus: 'autobus transporte publico',
    Train: 'tren ferrocarril',
    Plane: 'avion vuelo aereo',
    Ship: 'barco maritimo naviero',
    Bike: 'bicicleta ciclismo',
    Truck: 'camion carga transporte',
    Fuel: 'combustible gasolina repostar',
    TrafficCone: 'obras desvio precaucion',
    ParkingCircle: 'aparcamiento estacionar',
    Anchor: 'ancla puerto amarre',
    Caravan: 'caravana autocaravana viaje'
  }},

  { category: 'Clima', palette: 'cyan', icons: {
    Sun: 'sol soleado despejado claro',
    Moon: 'luna noche oscuro',
    CloudSun: 'parcialmente nublado',
    CloudRain: 'lluvia lluvioso precipitacion',
    CloudSnow: 'nieve nevada frio',
    CloudLightning: 'tormenta rayo electrico',
    Wind: 'viento brisa corriente',
    Snowflake: 'copo hielo helada',
    Thermometer: 'temperatura grados calor',
    Umbrella: 'paraguas proteccion lluvia',
    Rainbow: 'arcoiris color cielo',
    Tornado: 'tornado ciclon temporal'
  }},

  { category: 'Naturaleza', palette: 'lime', icons: {
    Leaf: 'hoja planta verde natural',
    TreePine: 'pino bosque conifera',
    TreeDeciduous: 'arbol frondoso follaje',
    Flower2: 'flor jardin primavera',
    Sprout: 'brote germinar crecer',
    Trees: 'bosque arboleda naturaleza',
    Waves: 'olas mar agua',
    Droplets: 'agua gotas humedad',
    Mountain: 'montaña sierra pico',
    Shell: 'concha playa marino',
    Bug: 'insecto bicho fauna',
    Recycle: 'reciclar reutilizar sostenible'
  }},

  { category: 'Animales', palette: 'brown', icons: {
    Dog: 'perro can mascota',
    Cat: 'gato felino mascota',
    Bird: 'pajaro ave volar',
    Fish: 'pez pescado acuario',
    Rabbit: 'conejo liebre',
    Turtle: 'tortuga lento',
    Snail: 'caracol lentitud',
    Squirrel: 'ardilla roedor',
    PawPrint: 'huella animal mascota',
    Egg: 'huevo nido origen',
    Feather: 'pluma ligero suave',
    Rat: 'raton roedor'
  }},

  { category: 'Comida', palette: 'orange', icons: {
    Coffee: 'cafe bebida caliente descanso',
    CupSoda: 'refresco vaso bebida',
    Pizza: 'pizza comida italiana',
    Sandwich: 'bocadillo almuerzo',
    Salad: 'ensalada saludable verduras',
    Apple: 'manzana fruta',
    Cake: 'pastel tarta celebracion',
    IceCream: 'helado postre dulce',
    Beef: 'carne proteina',
    Croissant: 'desayuno bolleria',
    Utensils: 'cubiertos comer restaurante',
    ChefHat: 'cocina chef receta'
  }},

  { category: 'Salud', palette: 'rose', icons: {
    Heart: 'corazon amor favorito like',
    HeartPulse: 'latido salud cardiaco',
    Stethoscope: 'medico consulta diagnostico',
    Pill: 'pastilla medicamento farmacia',
    Syringe: 'inyeccion vacuna jeringa',
    Cross: 'cruz sanitaria hospital',
    Ambulance: 'ambulancia emergencia',
    BriefcaseMedical: 'botiquin primeros auxilios',
    Bandage: 'venda herida cura',
    Brain: 'cerebro mente neurologia',
    Dna: 'adn genetica biologia',
    Microscope: 'microscopio analisis laboratorio'
  }},

  { category: 'Deporte', palette: 'lime', icons: {
    Dumbbell: 'pesa gimnasio entrenamiento',
    Bike: 'ciclismo bicicleta',
    Footprints: 'pasos caminar correr',
    Trophy: 'trofeo campeonato victoria',
    Medal: 'medalla podio premio',
    Volleyball: 'voleibol pelota',
    Goal: 'porteria gol objetivo',
    Timer: 'cronometro tiempo marca',
    Waves: 'natacion nadar piscina',
    Mountain: 'senderismo montañismo',
    Swords: 'esgrima duelo combate',
    Flame: 'calorias intensidad fuego'
  }},

  { category: 'Educación', palette: 'indigo', icons: {
    GraduationCap: 'graduacion universidad titulo',
    BookOpen: 'libro abierto lectura estudio',
    Book: 'libro manual guia',
    BookMarked: 'libro marcado referencia',
    Library: 'biblioteca coleccion',
    School: 'escuela colegio centro',
    Backpack: 'mochila estudiante material',
    NotebookPen: 'cuaderno apuntes tomar notas',
    PencilRuler: 'utiles dibujo tecnico',
    Atom: 'atomo ciencia fisica',
    FlaskConical: 'matraz quimica experimento',
    Telescope: 'telescopio astronomia observar'
  }},

  { category: 'Herramientas', palette: 'slate', icons: {
    Wrench: 'llave inglesa reparar mantenimiento',
    Hammer: 'martillo construir golpear',
    PocketKnife: 'navaja multiusos utiles',
    Drill: 'taladro perforar',
    Cog: 'engranaje mecanismo ajuste',
    Settings2: 'parametros configuracion avanzada',
    Toolbox: 'caja de herramientas kit',
    HardHat: 'casco obra seguridad laboral',
    Construction: 'construccion obras en curso',
    Axe: 'hacha cortar',
    Pickaxe: 'pico mineria extraer',
    Magnet: 'iman atraccion'
  }},

  { category: 'Hogar', palette: 'brown', icons: {
    House: 'casa hogar vivienda',
    DoorOpen: 'puerta abierta entrada acceso',
    DoorClosed: 'puerta cerrada salida',
    Bed: 'cama dormitorio descanso',
    Sofa: 'sofa salon mueble',
    Lamp: 'lampara luz iluminacion',
    Refrigerator: 'nevera frigorifico cocina',
    WashingMachine: 'lavadora colada',
    Bath: 'baño ducha aseo',
    Armchair: 'sillon butaca',
    Blinds: 'persiana ventana',
    Trash: 'basura desechos'
  }},

  { category: 'Diseño', palette: 'pink', icons: {
    Layers: 'capas estilos diseño layout',
    Shapes: 'formas geometria elementos',
    PenTool: 'pluma vectorial bezier',
    Brush: 'brocha pintura arte',
    Pipette: 'cuentagotas seleccionar color',
    Grid3x3: 'rejilla guias alineacion',
    Component: 'componente reutilizable',
    Blend: 'mezcla fusion opacidad',
    SwatchBook: 'muestrario paleta catalogo',
    Spline: 'curva trazo vectorial',
    Feather: 'trazo suave ligero',
    Wand2: 'varita efecto automatico'
  }},

  { category: 'Formas', palette: 'violet', icons: {
    Circle: 'circulo redondo punto',
    Square: 'cuadrado rectangulo',
    Triangle: 'triangulo pico',
    Hexagon: 'hexagono panal',
    Diamond: 'rombo diamante',
    Octagon: 'octagono señal',
    Pentagon: 'pentagono poligono',
    Asterisk: 'asterisco nota al pie',
    Plus: 'mas añadir sumar',
    Minus: 'menos quitar restar',
    Equal: 'igual equivalencia',
    Slash: 'barra division'
  }},

  { category: 'Caras', palette: 'amber', icons: {
    Smile: 'sonrisa feliz contento',
    Frown: 'triste descontento',
    Meh: 'indiferente neutral',
    Laugh: 'risa carcajada divertido',
    Angry: 'enfadado molesto',
    SmilePlus: 'reaccion añadir emocion',
    Annoyed: 'fastidiado hastiado',
    Heart: 'me encanta corazon',
    PartyPopper: 'celebracion fiesta enhorabuena',
    Ghost: 'fantasma anonimo',
    Skull: 'calavera critico fatal',
    HeartCrack: 'decepcion corazon roto'
  }},

  { category: 'Juegos', palette: 'violet', icons: {
    Gamepad2: 'mando videojuego consola',
    Dices: 'dados azar suerte',
    Puzzle: 'puzzle pieza encajar',
    Joystick: 'palanca arcade',
    Swords: 'combate duelo batalla',
    Crown: 'corona rey victoria',
    Spade: 'picas naipes cartas',
    Club: 'treboles naipes',
    Bomb: 'bomba explosivo riesgo',
    Rocket: 'nave espacial arcade',
    Trophy: 'logro desbloqueado',
    Gem: 'gema joya tesoro'
  }},

  { category: 'Viajes', palette: 'teal', icons: {
    Luggage: 'maleta equipaje viaje',
    BriefcaseBusiness: 'viaje de negocios',
    Plane: 'vuelo aeropuerto',
    PlaneTakeoff: 'despegue salida',
    PlaneLanding: 'aterrizaje llegada',
    Hotel: 'hotel alojamiento estancia',
    Palmtree: 'palmera vacaciones tropical',
    Sailboat: 'velero navegar',
    Backpack: 'mochilero excursion',
    TicketsPlane: 'billete reserva vuelo',
    BookUser: 'pasaporte documentacion identidad',
    Globe: 'destino internacional'
  }},

  { category: 'Energía', palette: 'lime', icons: {
    Zap: 'electricidad energia rayo',
    ZapOff: 'sin energia corte',
    BatteryCharging: 'cargando bateria',
    Sun: 'solar fotovoltaica renovable',
    Wind: 'eolica aerogenerador',
    Fuel: 'combustible fosil',
    Recycle: 'reciclaje economia circular',
    Leaf: 'ecologico sostenible verde',
    Lightbulb: 'consumo iluminacion',
    Flame: 'gas combustion calor',
    Atom: 'nuclear atomica',
    Gauge: 'consumo medidor eficiencia'
  }},

  { category: 'Accesibilidad', palette: 'blue', icons: {
    Accessibility: 'accesibilidad inclusion a11y',
    Eye: 'ver visible vista',
    EyeOff: 'oculto no visible',
    Ear: 'oido escuchar audicion',
    EarOff: 'sordera sin audio',
    Languages: 'idiomas traduccion multilingue',
    Captions: 'subtitulos texto alternativo',
    Contrast: 'contraste legibilidad',
    ZoomIn: 'ampliar texto legible',
    Hand: 'mano gesto tactil',
    Speech: 'voz habla lectura',
    PersonStanding: 'persona movilidad'
  }},

  { category: 'Marcadores', palette: 'rose', icons: {
    Bookmark: 'marcador favorito guardar',
    BookmarkCheck: 'guardado confirmado',
    Pin: 'fijar chincheta destacar',
    PinOff: 'dejar de fijar',
    Flag: 'bandera marcar reportar',
    Hash: 'etiqueta hashtag numero',
    Highlighter: 'resaltar destacar texto',
    StickyNote: 'nota adhesiva recordatorio',
    NotepadText: 'bloc de notas apuntes',
    ListTodo: 'tareas por hacer',
    CircleHelp: 'consulta pendiente',
    Anchor: 'ancla referencia enlace'
  }}
];

/* -------------------------------------------------------------------------- *
 * Derivados
 * -------------------------------------------------------------------------- */

/** Divide "AlertTriangle" -> ["alert", "triangle", "alerttriangle"] */
function nameKeywords(name) {
  const parts = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/\s+/);
  return [...new Set([...parts, name.toLowerCase()])];
}

/** Catálogo aplanado: [{ icon, category, palette, keywords }] */
export const ICON_CATALOG = CATALOG.flatMap(({ category, palette, icons }) =>
  Object.entries(icons).map(([icon, words]) => ({
    icon,
    category,
    palette,
    keywords: [...new Set([...words.split(/\s+/).filter(Boolean), ...nameKeywords(icon)])]
  }))
);

export const ICON_CATEGORIES = CATALOG.map(({ category, palette, icons }) => ({
  name: category,
  palette,
  count: Object.keys(icons).length
}));

const PALETTE_BY_ICON = new Map(ICON_CATALOG.map((item) => [item.icon, item.palette]));

/** Paleta duotono asignada a un icono por su categoría (fallback: azul). */
export function getDuoPalette(iconName) {
  const key = PALETTE_BY_ICON.get(iconName);
  return DUO_PALETTES[key] || DUO_PALETTES.blue;
}
