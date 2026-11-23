from playwright.sync_api import sync_playwright

errors = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on('console', lambda msg: errors.append(f'Console {msg.type}: {msg.text}') if msg.type in ['error'] else None)
    page.on('pageerror', lambda err: errors.append(f'PageError: {err}'))
    
    page.add_init_script('''
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: 1,
            nombre: 'Super',
            apellido: 'Admin',
            cedula: 'V-10000000',
            rol: 'superadmin',
            email: 'admin@aliprimera.edu.ve'
        }));
    ''')
    page.goto('http://localhost/Proyecto/superadmin/index.html')
    page.wait_for_timeout(2500)
    
    # Click on students tab
    page.evaluate("document.getElementById('sa-nav-students').click()")
    page.wait_for_timeout(1500)
    
    # Click on teachers tab
    page.evaluate("document.getElementById('sa-nav-teachers').click()")
    page.wait_for_timeout(1500)
    
    # Click on database tab
    page.evaluate("document.getElementById('sa-nav-database').click()")
    page.wait_for_timeout(1500)

    browser.close()

print('Total errors:', len(errors))
for e in errors:
    print(' -', e)

