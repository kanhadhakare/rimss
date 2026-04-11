# RIMSS Solution Architecture Diagrams

Based on the reference style and the requested diagram types, here are the architectural models for the RIMSS project.

## 1. Compact Solution Diagram
**Expressing entire solution idea in one compact diagram using icons.**
This groups the components by environments (Client, Server, External) and shows the communication protocols.

```mermaid
flowchart TD
    %% Web Client Environment
    subgraph ClientEnv ["🌐 Web Client Environment"]
        Desktop["fa:fa-desktop Desktop Browser<br/>(Chrome, Safari, Edge)"]
        Mobile["fa:fa-mobile Mobile Browser<br/>(iOS, Android)"]
    end

    %% Server Environment
    subgraph ServerEnv ["☁️ Server Environment"]
        direction LR
        AppServer["fa:fa-server Node.js Web/App Server<br/>(Express API)"]
        MongoDB["fa:fa-database Document Database<br/>(MongoDB)"]
        
        AppServer <-->|TCP / Mongoose| MongoDB
    end
    
    %% External Entities
    subgraph External ["🔌 External Entities"]
        Stripe["fa:fa-credit-card Payment Gateway<br/>(Stripe)"]
    end

    %% Connections
    Desktop <-->|Internet (HTTP/HTTPS)<br/>JSON| AppServer
    Mobile <-->|Internet (HTTP/HTTPS)<br/>JSON| AppServer
    AppServer <-->|Internet (HTTPS)<br/>JSON/XML| Stripe
    
    %% Styling based on the reference image
    classDef envBox fill:#f9f9f9,stroke:#999,stroke-dasharray: 5 5;
    class ClientEnv,ServerEnv,External envBox;
    
    classDef nodeBox fill:#e3f2fd,stroke:#64b5f6,stroke-width:1px;
    class Desktop,Mobile nodeBox;
    
    classDef serverBox fill:#bbdefb,stroke:#2196f3,stroke-width:2px;
    class AppServer serverBox;
    
    classDef dbBox fill:#dcedc8,stroke:#8bc34a,stroke-width:1px;
    class MongoDB dbBox;
    
    classDef extBox fill:#ffe0b2,stroke:#ff9800,stroke-width:1px;
    class Stripe extBox;
```

## 2. Transition Diagram
**Showing the transition from an old/legacy system to the new system.**
This illustrates moving from a traditional monolith tightly coupled to a SQL database, toward a decoupled SPA and REST API with a NoSQL database.

```mermaid
flowchart LR
    subgraph OldSystem ["legacy Monolithic System"]
        direction TB
        Monolith["fa:fa-server PHP/Java Monolith<br/>(Server-side rendered HTML)"]
        SQL["fa:fa-database Relational DB<br/>(MySQL)"]
        Monolith --> SQL
    end

    subgraph NewSystem ["✨ Modern RIMSS Architecture"]
        direction TB
        SPA["fa:fa-code Angular 17 SPA<br/>(Client-side Rendering)"]
        API["fa:fa-server Node.js Express REST API<br/>(Stateless)"]
        NoSQL["fa:fa-database Document DB<br/>(MongoDB)"]
        
        SPA -->|JSON API| API
        API -->|Mongoose| NoSQL
    end

    OldSystem ==>|Architecture Migration<br/>& Decoupling| NewSystem

    classDef legacy fill:#f5f5f5,stroke:#bdbdbd,color:#757575;
    class Monolith,SQL legacy;
    
    classDef modern fill:#e8f5e9,stroke:#4caf50,stroke-width:2px;
    class SPA,API,NoSQL modern;
```

## 3. Data Flow Diagram
**Diagram having arrows tagged with sequence numbers to show flow of data.**
This demonstrates the payment checkout and order placement flow in RIMSS.

```mermaid
flowchart TD
    User["fa:fa-user Customer"]
    App["fa:fa-laptop Angular Frontend"]
    Backend["fa:fa-server Node.js Backend"]
    Stripe["fa:fa-cc-stripe Stripe Service"]
    DB["fa:fa-database MongoDB"]

    User -->|1. Submit Checkout Form| App
    App -->|2. POST /api/payment/create-intent| Backend
    Backend -->|3. Call Stripe API to create charge| Stripe
    Stripe -->|4. Return Client Secret| Backend
    Backend -->|5. Forward Secret to Client| App
    App -->|6. Confirm Card Payment| Stripe
    Stripe -->|7. Webhook / Payment Success| App
    App -->|8. POST /api/orders| Backend
    Backend -->|9. Insert Order Document| DB
    DB -->|10. Acknowledge Creation| Backend
    Backend -->|11. Return 201 Created| App
    App -->|12. Show Success Confirmation| User

    classDef standard fill:#fff,stroke:#333;
    class User,App,Backend,Stripe,DB standard;
```

## 4. System Model (Alternative Technologies)
**Showing alternative technology options for the DAR Document.**
This outlines the choices evaluated for each tier of the stack, highlighting the final choices made for RIMSS.

```mermaid
flowchart TD
    subgraph Presentation ["Presentation Layer Alternatives"]
        direction LR
        A_Angular["fa:fa-brands fa-angular Angular 17<br/>✔️ Selected"]
        A_React["fa:fa-brands fa-react React.js"]
        A_Vue["fa:fa-code Vue.js"]
    end

    subgraph Application ["Application Logic Alternatives"]
        direction LR
        A_Node["fa:fa-brands fa-node-js Node.js & Express<br/>✔️ Selected"]
        A_Java["fa:fa-brands fa-java Spring Boot"]
        A_Python["fa:fa-brands fa-python Django"]
    end

    subgraph Data ["Data Layer Alternatives"]
        direction LR
        A_Mongo["fa:fa-envira MongoDB<br/>✔️ Selected"]
        A_Postgres["fa:fa-database PostgreSQL"]
        A_MySQL["fa:fa-database MySQL"]
    end

    Presentation ~~~ Application
    Application ~~~ Data

    %% Highlight styling for chosen technologies
    classDef chosen fill:#1a1a2e,stroke:#c9a96e,stroke-width:3px,color:#fff;
    class A_Angular,A_Node,A_Mongo chosen;
    
    classDef rejected fill:#f5f5f5,stroke:#ccc,color:#888;
    class A_React,A_Vue,A_Java,A_Python,A_Postgres,A_MySQL rejected;
```
