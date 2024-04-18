from dataclasses import dataclass
from httpx import AsyncClient
import pytest
import pytest_asyncio
from models.order import OrderStatus
from router.session import SessionResponse
from router.orders import (
    CreateOrderItemRequest,
    CreateOrderRequest,
    OrderResponse,
    OrderUpdateRequest,
)
from models.menuItem import MenuItem
from config import CONFIG
from models.category import Category
from models.user import User, UserRole
from utils.password import hash_password
from tests.integration.client import get_client


@pytest_asyncio.fixture()
async def setup_fixture():
    async with await get_client() as client:

        await User.delete_all()

        # Create the admin user
        adminUser = User(
            username=CONFIG.default_user_username,
            password=hash_password(CONFIG.default_user_password),
            role=UserRole.USER_ADMIN,
        )
        await adminUser.create()

        # Create a manager user
        managerUser = User(
            username="m", password=hash_password("m"), role=UserRole.MANAGER
        )
        await managerUser.create()

        # Create a wait staff user
        wait_staff_user = User(
            username="wait", password=hash_password("w"), role=UserRole.WAIT_STAFF
        )
        await wait_staff_user.create()

        # Create a wait staff user
        kitchen_user = User(
            username="kitchen", password=hash_password("k"), role=UserRole.KITCHEN_STAFF
        )
        await kitchen_user.create()

        # Create multiple customers
        for i in range(1, 11):
            customer = User(
                username=f"Table{i}",
                password=hash_password("t"),
                role=UserRole.CUSTOMER_TABLET,
            )
            await customer.create()

        await Category.delete_all()
        await MenuItem.delete_all()

        garlic_bread = MenuItem(
            name="Garlic Bread",
            description="Crispy Italian bread infused with aromatic roasted garlic.",
            health_requirements=["Vegetarian"],
            ingredients=["Italian Bread", "Roasted Garlic", "Olive Oil"],
            price=10,
            photo_url="https://thebusybaker.ca/wp-content/uploads/2018/08/easy-homemade-garlic-bread-3.jpg",
        )
        await garlic_bread.create()

        focaccia = MenuItem(
            name="Focaccia",
            price=12,
            description="Soft, herb-infused Italian flatbread, perfect for dipping in the provided olive Oil and balsamic vinegar.",
            health_requirements=["Vegetarian"],
            ingredients=["A Homemade Italian Herb Mix", "Olive Oil"],
            photo_url="https://www.inspiredtaste.net/wp-content/uploads/2016/07/Focaccia-Bread-Recipe-1-1200.jpg",
        )
        await focaccia.create()

        truffle_platter = MenuItem(
            name="Truffle Platter",
            price=16,
            description="Luxurious truffle cheese assortment paired with savory cured meats and artisanal crackers",
            health_requirements=["Pork", "Contains Nuts"],
            ingredients=[
                "Truffle-infused Cheese Varieties",
                "Prosciutto",
                "Coppa",
                "Gourmet Crackers",
                "Nuts",
            ],
            photo_url="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.thisvivaciouslife.com%2Fwp-content%2Fuploads%2F2022%2F02%2FSmall-Charcuterie-Board-1200x1200-1.jpg&f=1&nofb=1&ipt=76c127be365af8fbcb3d9e7bfb4e9621c6f0acb3facd9890b8952caa65a5298d&ipo=images",
        )
        await truffle_platter.create()

        entree_category = Category(
            index=0,
            menu_items=[
                str(garlic_bread.id),
                str(focaccia.id),
                str(truffle_platter.id),
            ],
            name="Entrees",
        )
        await entree_category.create()

        margherita_pizza = MenuItem(
            name="Margherita Pizza",
            description="Classic Italian pizza topped with tangy tomato sauce, fresh mozzarella, and fragrant basil.",
            health_requirements=["Vegetarian"],
            ingredients=[
                "Homemade Tomato Sauce",
                "Fresh mozzarella",
                "Fragrant basil",
            ],
            price=21,
            photo_url="https://www.cookingclassy.com/wp-content/uploads/2017/08/margherita-pizza-9-768x1148.jpg",
        )
        await margherita_pizza.create()

        hawaiian_pizza = MenuItem(
            name="Hawaiian Pizza",
            description="Tropical twist on classic pizza with ham, pineapple, and melted mozzarella.",
            health_requirements=["Contains Pork"],
            ingredients=[
                "Ham",
                "Homemade Tomato Sauce",
                "Fresh Pineapple",
                "Melted mozzarella",
            ],
            price=24,
            photo_url="https://www.crazyforcrust.com/wp-content/uploads/2023/01/Hawaiian-Pizza-5-768x1152.jpg",
        )
        await hawaiian_pizza.create()

        spicy_pepperoni = MenuItem(
            name="Spicy Pepperoni Pizza",
            description="Fiery pepperoni slices atop a bed of melted mozzarella and zesty tomato sauce.",
            health_requirements=["Contains Pork", "Spicy"],
            ingredients=[
                "Pepperoni",
                "Homemade Tomato Sauce",
                "Melted mozzarella",
            ],
            price=26,
            photo_url="https://insanelygoodrecipes.com/wp-content/uploads/2022/04/Tasty-Pepperoni-Pizza-with-Cheese-683x1024.jpg",
        )
        await spicy_pepperoni.create()

        pizzas = Category(
            index=2,
            menu_items=[
                str(margherita_pizza.id),
                str(hawaiian_pizza.id),
                str(spicy_pepperoni.id),
            ],
            name="Pizzas",
        )
        await pizzas.create()

        carbonara = MenuItem(
            name="Carbonara",
            description="Rich pasta dish featuring creamy egg sauce, crispy pancetta, and Parmesan.",
            health_requirements=["Contains Pork", "Contains Eggs"],
            ingredients=[
                "Spaghetti or Fettuccine pasta",
                "Local Eggs",
                "Pancetta",
                "Fresh Parmesan cheese",
            ],
            price=25,
            photo_url="https://easyweeknight.com/wp-content/uploads/2019/02/spaghetti-carbonara5-n.jpg.webp",
        )
        await carbonara.create()

        spaghetti_bolognese = MenuItem(
            name="Spaghetti Bolognese",
            description="Classic spaghetti dish with hearty meat sauce, simmered with tomatoes and herbs.",
            health_requirements=["Contains Beef"],
            ingredients=[
                "Spaghetti pasta",
                "Ground beef",
                "Tomato sauce",
                "Italian herbs",
            ],
            price=24,
            photo_url="https://vikalinka.com/wp-content/uploads/2020/03/Spaghetti-Bolognese-13-Edit.jpg",
        )
        await spaghetti_bolognese.create()

        fettuccine_alfredo = MenuItem(
            name="Fettuccine Chicken Alfredo",
            description="Creamy pasta dish featuring fettuccine noodles tossed in a rich Parmesan Alfredo sauce.",
            health_requirements=[""],
            ingredients=[
                "Fettuccine pasta",
                "Heavy cream",
                "Fresh Parmesan cheese",
                "Chicken",
            ],
            price=22,
            photo_url="https://addapinch.com/wp-content/uploads/2014/09/alfredo-sauce-recipe-0436-c-700x811.jpg",
        )
        await fettuccine_alfredo.create()

        lasagna = MenuItem(
            name="Lasagna",
            description="Layers of pasta sheets, rich meat sauce, creamy béchamel, and melted cheese.",
            health_requirements=["Contains Beef", "Contains Pork"],
            ingredients=[
                "Lasagna noodles",
                "Ground beef",
                "Italian sausage",
                "Béchamel sauce",
                "Mozzarella cheese",
            ],
            price=23,
            photo_url="https://i0.wp.com/josieandcarloskitchen.com/wp-content/uploads/2020/12/Lasagna.jpg?w=596&ssl=1",
        )
        await lasagna.create()

        pastas = Category(
            index=2,
            menu_items=[
                str(carbonara.id),
                str(spaghetti_bolognese.id),
                str(fettuccine_alfredo.id),
                str(lasagna.id),
            ],
            name="Pastas",
        )
        await pastas.create()

        mains_category = Category(
            index=1,
            menu_items=[
                str(margherita_pizza.id),
                str(hawaiian_pizza.id),
                str(spicy_pepperoni.id),
                str(carbonara.id),
                str(spaghetti_bolognese.id),
                str(fettuccine_alfredo.id),
                str(lasagna.id),
            ],
            name="Mains",
        )
        await mains_category.create()

        tiramisu = MenuItem(
            name="Tiramisu",
            description="Decadent Italian dessert with layers of espresso-soaked ladyfingers and mascarpone cream.",
            health_requirements=["Contains Alcohol"],
            ingredients=[
                "Ladyfingers",
                "Mascarpone cheese",
                "Espresso",
                "Cocoa powder",
                "Marsala wine",
            ],
            price=9,
            photo_url="https://handletheheat.com/wp-content/uploads/2023/12/best-tiramisu-recipe-SQUARE-1536x1536.jpg",
        )
        await tiramisu.create()

        gelato = MenuItem(
            name="Gelato",
            description="Creamy Italian frozen dessert, made with fresh milk, sugar, and natural flavors.",
            health_requirements=["Vegetarian", "Contains Dairy"],
            ingredients=[],
            price=8,
            photo_url="https://static01.nyt.com/images/2018/07/20/dining/04COOKING-LEMONGELATO1/04COOKING-LEMONGELATO1-master768.jpg?w=1280&q=75",
        )
        await gelato.create()

        desserts = Category(
            index=2,
            menu_items=[
                str(tiramisu.id),
                str(gelato.id),
            ],
            name="Desserts",
        )
        await desserts.create()

        pina_colada = MenuItem(
            name="Pina Colada",
            description="Tropical cocktail blending coconut cream, pineapple juice, and rum over ice.",
            health_requirements=["Contains Alcohol"],
            ingredients=[
                "Coconut cream",
                "Pineapple juice",
                "Rum",
            ],
            price=14,
            photo_url="https://relishdelish.ca/wp-content/uploads/2020/07/1562077390568-800x620.jpeg",
        )
        await pina_colada.create()

        peach_bellini = MenuItem(
            name="Peach Bellini",
            description="Elegant cocktail crafted with sparkling wine and peach purée, served chilled.",
            health_requirements=["Contains Alcohol"],
            ingredients=["Sparkling wine", "Peach purée"],
            price=16,
            photo_url="https://cookieandkate.com/images/2019/07/best-peach-bellini-recipe-4-768x1154.jpg",
        )
        await peach_bellini.create()

        chardonnay_white_wine = MenuItem(
            name="Chardonnay White Wine",
            description="Crisp and refreshing white wine with fruity notes and a hint of oak.",
            health_requirements=["Contains Alcohol"],
            ingredients=[],
            price=12,
            photo_url="https://www.elitefridges.co.uk/cdn/shop/articles/white-wine-decanting-process_5d58aa73-f069-4eb0-90b5-33b2449c3be1.jpg?v=1683119010&width=1000",
        )
        await chardonnay_white_wine.create()

        drinks = Category(
            index=2,
            menu_items=[
                str(pina_colada.id),
                str(peach_bellini.id),
                str(chardonnay_white_wine.id),
            ],
            name="Drinks",
        )
        await drinks.create()

        yield MenuDTO(
            garlic_bread,
            focaccia,
            truffle_platter,
            margherita_pizza,
            hawaiian_pizza,
            spicy_pepperoni,
            carbonara,
            spaghetti_bolognese,
            fettuccine_alfredo,
            lasagna,
            tiramisu,
            gelato,
            pina_colada,
            peach_bellini,
            chardonnay_white_wine,
        )


@dataclass
class MenuDTO:
    garlic_bread: MenuItem
    focaccia: MenuItem
    truffle_platter: MenuItem
    margherita_pizza: MenuItem
    hawaiian_pizza: MenuItem
    spicy_pepperoni: MenuItem
    carbonara: MenuItem
    spaghetti_bolognese: MenuItem
    fettuccine_alfredo: MenuItem
    lasagna: MenuItem
    tiramisu: MenuItem
    gelato: MenuItem
    pina_colada: MenuItem
    peach_bellini: MenuItem
    chardonnay_white_wine: MenuItem


@pytest_asyncio.fixture()
async def manager_client(setup_fixture):

    async with await get_client() as client:

        login_response = await client.post(
            "/auth/login", json={"username": "m", "password": "m"}
        )

        assert login_response.status_code == 200
        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        yield client
        # Dispose of client


@pytest.mark.asyncio
async def test_multiple_customers_seed(
    manager_client: AsyncClient, setup_fixture: MenuDTO
):

    async with await get_client() as client:

        ### log in as table 2, and start a session. ###
        login_response = await client.post(
            "/auth/login",
            json={
                "username": "Table2",
                "password": "t",
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_session_response = await client.post(
            "/session/start",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert create_session_response.status_code == 200
        session_response = SessionResponse.model_validate(
            create_session_response.json()
        )

        # Create an order for the only menu item
        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.garlic_bread.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes=None,
                ),
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.margherita_pizza.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes=None,
                ),
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.chardonnay_white_wine.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes=None,
                ),
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200
        order_response = OrderResponse.model_validate(response.json())

        for item in order_response.items:
            response = await manager_client.post(
                f"/order/{order_response.id}/{item.id}",
                json=OrderUpdateRequest(status=OrderStatus.PREPARING).model_dump(),
            )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[2].id}",
            json=OrderUpdateRequest(status=OrderStatus.READY).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[2].id}",
            json=OrderUpdateRequest(status=OrderStatus.DELIVERING).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[2].id}",
            json=OrderUpdateRequest(status=OrderStatus.DELIVERED).model_dump(),
        )

        ### Login as another user, create the same order but update the state. ###
        # log in as table 1, and start a session.
        login_response = await client.post(
            "/auth/login",
            json={
                "username": "Table1",
                "password": "t",
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_session_response = await client.post(
            "/session/start",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert create_session_response.status_code == 200
        session_response = SessionResponse.model_validate(
            create_session_response.json()
        )

        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.focaccia.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                ),
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.truffle_platter.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                ),
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.peach_bellini.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                ),
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.peach_bellini.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                ),
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200
        order_response = OrderResponse.model_validate(response.json())

        for item in order_response.items:
            response = await manager_client.post(
                f"/order/{order_response.id}/{item.id}",
                json=OrderUpdateRequest(status=OrderStatus.PREPARING).model_dump(),
            )

            response = await manager_client.post(
                f"/order/{order_response.id}/{item.id}",
                json=OrderUpdateRequest(status=OrderStatus.READY).model_dump(),
            )

            response = await manager_client.post(
                f"/order/{order_response.id}/{item.id}",
                json=OrderUpdateRequest(status=OrderStatus.DELIVERING).model_dump(),
            )

            response = await manager_client.post(
                f"/order/{order_response.id}/{item.id}",
                json=OrderUpdateRequest(status=OrderStatus.DELIVERED).model_dump(),
            )

        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.chardonnay_white_wine.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                ),
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.chardonnay_white_wine.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                ),
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200

        # Login as another user, create the same order but update the state.
        # log in as table 3, and start a session.
        login_response = await client.post(
            "/auth/login",
            json={
                "username": "Table3",
                "password": "t",
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_session_response = await client.post(
            "/session/start",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert create_session_response.status_code == 200
        session_response = SessionResponse.model_validate(
            create_session_response.json()
        )

        # Create an order for the only menu item
        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.chardonnay_white_wine.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                )
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200
        order_response = OrderResponse.model_validate(response.json())
        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.PREPARING).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.READY).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.DELIVERING).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.DELIVERED).model_dump(),
        )

        # Create an order for the only menu item
        payload = CreateOrderRequest(
            session_id=session_response.id,
            items=[
                CreateOrderItemRequest(
                    menu_item_id=str(setup_fixture.lasagna.id),
                    is_free=False,
                    preferences=[""],
                    additional_notes="",
                )
            ],
        )
        response = await client.post("/order", json=payload.model_dump())
        assert response.status_code == 200
        order_response = OrderResponse.model_validate(response.json())

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.PREPARING).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.READY).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.DELIVERING).model_dump(),
        )

        response = await manager_client.post(
            f"/order/{order_response.id}/{order_response.items[0].id}",
            json=OrderUpdateRequest(status=OrderStatus.DELIVERED).model_dump(),
        )

        # Lock the session
        response = await client.post("/session/lock")
        assert response.status_code == 200

        # log in as table 4, and start a session.
        login_response = await client.post(
            "/auth/login",
            json={
                "username": "Table4",
                "password": "t",
            },
        )
        assert login_response.status_code == 200

        tokens = login_response.json()
        client.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        create_session_response = await client.post(
            "/session/start",
        )
        assert create_session_response.status_code == 200
        session_response = SessionResponse.model_validate(
            create_session_response.json()
        )

        resp = await client.put("/session/assistance-request/create")
        assert resp.status_code == 200
