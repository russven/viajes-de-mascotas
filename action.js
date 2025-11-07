/* PetWings interactive script
     - búsqueda simulada de vuelos para mascotas
     - apertura de modal de reserva
     - validaciones sobre tamaño de mascota
     - confetti al completar reserva
     - animaciones y accesibilidad mínima
*/

// Smooth scroll for internal anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(contactForm);
            console.log('Contacto:', Object.fromEntries(fd.entries()));
            showToast('¡Mensaje enviado! Te responderemos pronto.');
            contactForm.reset();
        });
    }

    // Search form: simulate results
    const searchForm = document.getElementById('search');
    const results = document.getElementById('results');
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');

    if (searchForm && results) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(searchForm);
            const data = Object.fromEntries(fd.entries());
            results.innerHTML = '';
            // Simple validation: large pets can't go in cabin
            if (data.petSize === 'large' && data.petType !== 'ave') {
                showToast('Mascota grande — se requiere transporte en bodega. Te mostraremos opciones.');
            }

            // Simulate fetching available flights (3 items)
            const simulated = generateFlights(data);
            simulated.forEach(f => results.appendChild(createFlightCard(f)));
            results.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Modal open/close
    document.querySelectorAll('.flight-card, .btn.primary').forEach(el => {});

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.reserve-btn')) {
            const flight = e.target.closest('.flight-card');
            openBookingModal(flight ? flight.dataset.flightId : '');
        }
        if (e.target.matches('.modal-close')) closeBookingModal();
        if (e.target.id === 'open-info') showInfo();
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBookingModal();
    });

    // Booking form submit
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(bookingForm);
            const values = Object.fromEntries(fd.entries());
            console.log('Reserva:', values);
            // Minimal validation: phone length
            if (!values.phone || values.phone.length < 6) {
                showToast('Por favor, indica un teléfono válido');
                return;
            }
            // Success -> confetti
            triggerConfetti(40);
            showToast('Reserva confirmada. Te enviamos los detalles por email.');
            bookingForm.reset();
            setTimeout(closeBookingModal, 1200);
        });
    }

    // small helper: close if click outside modal content
    bookingModal && bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) closeBookingModal();
    });
});

/* Helpers */
function generateFlights(formData) {
    // make 2-3 fake flights based on input
    const base = [
        { id: 'PW'+Date.now()%1000+'A', carrier: 'PetAir', depart: formData.from || 'MAD', arrive: formData.to || 'BCN', time: '08:30', price: 79 + Math.floor(Math.random()*100) },
        { id: 'PW'+(Date.now()%900+100)+'B', carrier: 'WingPets', depart: formData.from || 'MAD', arrive: formData.to || 'BCN', time: '13:45', price: 99 + Math.floor(Math.random()*140) },
        { id: 'PW'+(Date.now()%800+200)+'C', carrier: 'CompanionFly', depart: formData.from || 'MAD', arrive: formData.to || 'BCN', time: '19:20', price: 129 + Math.floor(Math.random()*200) }
    ];
    // If large pet and cabin requested, mark restricted
    return base.map(b => ({ ...b, restrictions: (formData.petSize==='large' && formData.petType!=='ave') ? 'Bodega requerida' : 'Cabina disponible', petType: formData.petType, petSize: formData.petSize }));
}

function createFlightCard(f) {
    const el = document.createElement('div');
    el.className = 'flight-card';
    el.dataset.flightId = f.id;
    el.innerHTML = `
        <div class="flight-meta">
            <div>
                <strong>${f.carrier} · ${f.id}</strong>
                <div>${f.depart} → ${f.arrive} · ${f.time}</div>
            </div>
        </div>
        <div class="flight-action">
            <div style="text-align:right;margin-bottom:6px">${f.restrictions}</div>
            <div style="display:flex;gap:.6rem;align-items:center;justify-content:flex-end">
                <div style="font-weight:700">€${f.price}</div>
                <button class="btn primary reserve-btn">Reservar</button>
            </div>
        </div>
    `;
    // subtle entrance
    el.style.opacity = 0; el.style.transform = 'translateY(12px)';
    requestAnimationFrame(()=>{el.style.transition = 'opacity .45s ease, transform .45s ease'; el.style.opacity = 1; el.style.transform = 'translateY(0)';});
    return el;
}

function openBookingModal(flightId){
    const modal = document.getElementById('booking-modal');
    if(!modal) return;
    modal.setAttribute('aria-hidden','false');
    // focus first input
    setTimeout(()=>{const i=modal.querySelector('input');i&&i.focus();},80);
}

function closeBookingModal(){
    const modal = document.getElementById('booking-modal');
    if(!modal) return; modal.setAttribute('aria-hidden','true');
}

/* Simple toast */
function showToast(msg){
    const t = document.createElement('div');
    t.textContent = msg; t.style.position='fixed'; t.style.right='16px'; t.style.bottom='16px'; t.style.background='rgba(27,43,58,0.97)'; t.style.color='#fff'; t.style.padding='10px 14px'; t.style.borderRadius='10px'; t.style.boxShadow='0 8px 30px rgba(10,30,60,0.18)'; t.style.zIndex=4000; t.style.opacity=0; t.style.transform='translateY(10px)'; document.body.appendChild(t);
    requestAnimationFrame(()=>{t.style.transition='opacity .28s,transform .28s'; t.style.opacity=1; t.style.transform='translateY(0)'});
    setTimeout(()=>{t.style.opacity=0; t.style.transform='translateY(10px)'; setTimeout(()=>t.remove(),300)},3500);
}

/* Confetti generator (simple) */
function triggerConfetti(amount=30){
    const wrap = document.getElementById('confetti');
    if(!wrap) return;
    const colors = ['#ff6b6b','#ffd93d','#6bf1c6','#7aa2ff','#ff9fb1'];
    for(let i=0;i<amount;i++){
        const dot = document.createElement('div');
        dot.className='confetti-piece';
        const size = Math.random()*10+6;
        dot.style.position='absolute';
        dot.style.left = (50 + (Math.random()*80-40)) + '%';
        dot.style.top = '-10%';
        dot.style.width = size+'px'; dot.style.height = (size*0.6)+'px';
        dot.style.background = colors[Math.floor(Math.random()*colors.length)];
        dot.style.opacity = 0.95; dot.style.borderRadius='2px'; dot.style.transform = 'rotate('+ (Math.random()*360)+'deg)'; dot.style.zIndex=9999;
        dot.style.transition = 'transform 2.2s linear, top 2.2s linear, opacity .7s linear';
        wrap.appendChild(dot);
        // force layout then animate
        requestAnimationFrame(()=>{
            dot.style.top = (70 + Math.random()*30) + '%';
            dot.style.transform = 'rotate('+ (Math.random()*720)+'deg) translateY(10px)';
        });
        // fade
        setTimeout(()=>{dot.style.opacity=0;},1900);
        setTimeout(()=>{dot.remove();},2600);
    }
}

/* Info overlay */
function showInfo(){
    const el = document.createElement('div');
    el.className='info-overlay';
    el.style.position='fixed'; el.style.inset='0'; el.style.background='rgba(3,12,26,0.6)'; el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='center'; el.style.zIndex=4500;
    el.innerHTML = `<div style="background:#fff;padding:1.2rem;border-radius:12px;max-width:640px;text-align:left"><h3>¿Cómo funciona?</h3><p>PetWings gestiona el traslado seguro de mascotas: documentación, caja homologada y opciones de cabina o bodega según tamaño. Después de la búsqueda selecciona "Reservar" para completar tus datos.</p><div style="text-align:right"><button class='btn ghost close-info'>Cerrar</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('.close-info').addEventListener('click', ()=>el.remove());
}