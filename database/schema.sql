DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS associations CASCADE;
DROP TABLE IF EXISTS families CASCADE;

CREATE TABLE families (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(150) NOT NULL,
  quotient_familial  NUMERIC(8,2) NOT NULL
);

CREATE TABLE associations (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    contact_email       VARCHAR(200) NOT NULL,
    contact_phone       VARCHAR(30)
);

CREATE TABLE facilities (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    address             VARCHAR(150) NOT NULL,
    erp_capacity        INTEGER NOT NULL CHECK (erp_capacity > 0),
    is_divisible        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE members (
    id              SERIAL PRIMARY KEY,
    family_id       INTEGER NOT NULL REFERENCES families(id),
    first_name      VARCHAR(150) NOT NULL,
    last_name       VARCHAR(150) NOT NULL,
    birth_date      DATE NOT NULL,
    is_resident     BOOLEAN NOT NULL DEFAULT FALSE,
    medical_certificate_date       DATE,
    pass_sport_code VARCHAR(70)
);

    CREATE TABLE activities (
    id                  SERIAL PRIMARY KEY,
    facility_id         INTEGER NOT NULL REFERENCES facilities(id),
    association_id      INTEGER NOT NULL REFERENCES associations(id),
    name                VARCHAR(150) NOT NULL,
    sport_type          VARCHAR(150) NOT NULL,
    is_high_risk        BOOLEAN NOT NULL DEFAULT FALSE,
    age_category        VARCHAR(10) NOT NULL,
    base_price          NUMERIC(8,2) NOT NULL,
    max_capacity        INTEGER NOT NULL CHECK (max_capacity > 0),
    subzone             VARCHAR(100),
    day_of_week         SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL CHECK (end_time > start_time)
);

CREATE TABLE registrations (
    id              SERIAL PRIMARY KEY,
    member_id       INTEGER NOT NULL REFERENCES members(id),
    activity_id     INTEGER NOT NULL REFERENCES activities(id),
    final_price     NUMERIC(8,2) NOT NULL CHECK (final_price >= 15.00),
    status          VARCHAR(30) NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'cancelled', 'medical_non_compliant')),
    payment_plan    VARCHAR(20) NOT NULL DEFAULT 'full'
                    CHECK (payment_plan IN ('full', 'three_installments')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, activity_id)
);

CREATE TABLE waiting_list (
    id                      SERIAL PRIMARY KEY,
    activity_id             INTEGER NOT NULL REFERENCES activities(id),
    member_id               INTEGER NOT NULL REFERENCES members(id),
    priority_score          INTEGER NOT NULL DEFAULT 0,
    status                  VARCHAR(30) NOT NULL DEFAULT 'waiting'
                            CHECK (status IN ('waiting', 'promoted_pending', 'expired', 'confirmed')),
    deadline_confirmation   TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, activity_id)
);