-- Initializes the pubminer schema. 

CREATE TABLE article (
  pmcid character varying(15),
  pmid character varying(15)
)

;CREATE TABLE gender (
  pmcid character varying(15),
  value_type character varying(255),
  gender_type character varying(255),
  val real
);

CREATE TABLE race (
  pmcid character varying(15),
  value_type character varying(255),
  race_type character varying(255),
  val real
);

CREATE TABLE age (
  pmcid character varying(15),
  value_type character varying(255),
  val real
);


