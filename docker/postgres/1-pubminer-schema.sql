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

CREATE VIEW gender_race_v AS 
  SELECT r.pmcid,
    'RACE' AS val_type,
    r.race_type AS val_label,
    r.val AS count,
    (r.val/t.total) AS perc
    
  FROM race r

  JOIN(
    SELECT pmcid,
      SUM(val) AS total
      
    FROM race
    WHERE value_type = 'COUNT'
    GROUP BY 1
  ) t
  ON t.pmcid = r.pmcid

  UNION

  SELECT g.pmcid,
    'GENDER' AS val_type,
    g.gender_type AS val_label,
    g.val AS count,
    (g.val/t.total) AS perc
    
  FROM gender g

  JOIN(
    SELECT pmcid,
      SUM(val) AS total
      
    FROM gender
    WHERE value_type = 'COUNT'
    GROUP BY 1
  ) t
  ON t.pmcid = g.pmcid;