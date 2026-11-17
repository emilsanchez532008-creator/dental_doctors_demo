/* =================================================================
   CLÍNICA NUBE MAIN.JS - DEMOSTRACIÓN
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. MENÚ HAMBURGUESA RESPONSIVO */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburgerBtn && navMenu) {
    const icon = hamburgerBtn.querySelector('i');
    const setMenuOpen = (isOpen) => {
      navMenu.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      if (icon) {
        icon.classList.toggle('fa-bars', !isOpen);
        icon.classList.toggle('fa-xmark', isOpen);
      }
    };

    setMenuOpen(false);
    hamburgerBtn.addEventListener('click', () => {
      setMenuOpen(!navMenu.classList.contains('active'));
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setMenuOpen(false);
    });
  }

  document.querySelectorAll('[data-dialog-open]').forEach(opener => {
    const dialog = document.getElementById(opener.dataset.dialogOpen);
    if (!dialog) return;

    opener.addEventListener('click', event => {
      if (opener.matches('a')) event.preventDefault();
      dialog.showModal();
    });
  });

  document.querySelectorAll('.legal-dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-dialog-close]').forEach(button => {
      button.addEventListener('click', () => dialog.close());
    });

    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
      }
    });

    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  });

  /* 2. SLIDER ANTES / DESPUÉS INTERACTIVO */
  function initBeforeAfterSlider(containerId, afterLayerId, dividerId) {
    const container = document.getElementById(containerId);
    const afterLayer = document.getElementById(afterLayerId);
    const divider = document.getElementById(dividerId);

    if (!container || !afterLayer || !divider) return;

    let isDragging = false;
    let percentage = 50;

    divider.setAttribute('role', 'slider');
    divider.setAttribute('tabindex', '0');
    divider.setAttribute('aria-valuemin', '0');
    divider.setAttribute('aria-valuemax', '100');
    divider.setAttribute('aria-valuenow', String(percentage));

    const updateSlider = (clientX) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;

      const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      percentage = (offsetX / rect.width) * 100;
      afterLayer.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      divider.style.left = `${percentage}%`;
      divider.setAttribute('aria-valuenow', String(Math.round(percentage)));
    };

    container.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      isDragging = true;
      container.setPointerCapture(event.pointerId);
      updateSlider(event.clientX);
      event.preventDefault();
    });

    container.addEventListener('pointermove', event => {
      if (isDragging) updateSlider(event.clientX);
    });

    const stopDragging = () => {
      isDragging = false;
    };
    container.addEventListener('pointerup', stopDragging);
    container.addEventListener('pointercancel', stopDragging);
    container.addEventListener('lostpointercapture', stopDragging);

    divider.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      percentage = Math.max(0, Math.min(100, percentage + (event.key === 'ArrowRight' ? step : -step)));
      const rect = container.getBoundingClientRect();
      updateSlider(rect.left + rect.width * percentage / 100);
    });

    updateSlider(container.getBoundingClientRect().left + container.getBoundingClientRect().width * percentage / 100);
  }

  // Inicializar Sliders de Casos de Éxito
  initBeforeAfterSlider('baSlider', 'baAfterLayer', 'baDivider');
  initBeforeAfterSlider('baSlider2', 'baAfterLayer2', 'baDivider2');


  /* 3. FILTRO DE SERVICIOS POR CATEGORÍA */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  if (filterBtns.length > 0 && serviceCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Cambiar clases activas de botones
        filterBtns.forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-outline');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
        btn.setAttribute('aria-pressed', 'true');

        const category = btn.dataset.filter;

        serviceCards.forEach(card => {
          const matches = category === 'all' || card.dataset.category === category;
          card.style.display = matches ? '' : 'none';
        });
      });
    });
  }


  /* 4. VALIDACIÓN DEL FORMULARIO DE DEMOSTRACIÓN */
  const appointmentForm = document.getElementById('appointmentForm');
  const successMessage = document.getElementById('formSuccessMessage');
  const appointmentDate = document.getElementById('fecha');
  const appointmentTime = document.getElementById('hora');

  if (appointmentDate && appointmentTime) {
    appointmentDate.addEventListener('change', () => {
      const selectedDate = appointmentDate.value;
      appointmentTime.replaceChildren();

      if (!selectedDate) {
        appointmentDate.setCustomValidity('');
        appointmentTime.add(new Option('Selecciona primero un día...', ''));
        appointmentTime.disabled = true;
        return;
      }

      const [year, month, day] = selectedDate.split('-').map(Number);
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      appointmentDate.setCustomValidity(dayOfWeek === 0 ? 'La clínica permanece cerrada los domingos.' : '');
      const availableTimes = dayOfWeek === 0
        ? []
        : dayOfWeek === 6
          ? ['10:00 a.m.', '11:00 a.m.', '12:00 p.m.', '1:00 p.m.', '2:00 p.m.']
          : ['10:00 a.m.', '11:00 a.m.', '12:00 p.m.', '1:00 p.m.', '2:00 p.m.', '3:00 p.m.', '4:00 p.m.', '5:00 p.m.', '6:00 p.m.', '7:00 p.m.'];

      appointmentTime.add(new Option(
        availableTimes.length ? 'Selecciona un horario...' : 'Domingo: cerrado',
        ''
      ));
      availableTimes.forEach(time => appointmentTime.add(new Option(time, time)));
      appointmentTime.disabled = availableTimes.length === 0;
    });
  }

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!appointmentForm.reportValidity()) return;

      if (successMessage) {
        successMessage.style.display = 'block';
        appointmentForm.style.opacity = '0.5';
        appointmentForm.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
      }
    });
  }


  /* 5. ANIMACIONES AL SCROLL CON INTERSECTION OBSERVER */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          currentObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.service-card, .guarantee-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });
  }

});