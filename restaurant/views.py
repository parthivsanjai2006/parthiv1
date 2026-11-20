import json
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Dish, ContactMessage, Order, OrderItem
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm


def index(request):
    dishes = Dish.objects.filter(is_available=True)
    return render(request, 'restaurant/index.html', {'dishes': dishes})


def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')

        if name and email and message:
            ContactMessage.objects.create(name=name, email=email, message=message)
            messages.success(request, 'Thank you! Un message anuppa pattuduchu.')
        else:
            messages.error(request, 'Ella fields um fill pannunga.')

    return redirect('/#contact')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index')
    else:
        form = UserCreationForm()
    return render(request, 'restaurant/signup.html', {'form': form})


def cart(request):
    return render(request, 'restaurant/cart.html')


@require_POST
def place_order(request):
    # MAATRAM 1: Login pannirukkiya nu check
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Please Login For Order'}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid data'}, status=400)

    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    address = (data.get('address') or '').strip()
    items = data.get('items') or []

    if not name or not phone or not address or not items:
        return JsonResponse({'success': False, 'error': 'Please Fill The Details'}, status=400)

    # MAATRAM 2: user=request.user add pannirukken
    order = Order.objects.create(user=request.user, name=name, phone=phone, address=address, total=0)
    total = 0

    for item in items:
        try:
            dish = Dish.objects.get(id=int(item['id']), is_available=True)
            qty = int(item['qty'])
        except (Dish.DoesNotExist, KeyError, ValueError, TypeError):
            continue
        if qty < 1:
            continue
        OrderItem.objects.create(order=order, dish_name=dish.name, price=dish.price, quantity=qty)
        total += dish.price * qty

    if total == 0:
        order.delete()
        return JsonResponse({'success': False, 'error': 'There Is No Valid Dishes'}, status=400)

    order.total = total
    order.save()
    return JsonResponse({'success': True, 'order_id': order.id})