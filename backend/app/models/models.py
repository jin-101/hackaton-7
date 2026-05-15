from __future__ import annotations
from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, DateTime, Date, Text, Enum
from sqlalchemy.orm import mapped_column, Mapped, relationship
import enum

from app.database import Base


class TierCode(str, enum.Enum):
    PRESTIGE = "prestige"
    ECONOMY_FULL = "economy_full"
    ECONOMY_DISCOUNT = "economy_discount"
    ECONOMY_SPECIAL = "economy_special"


class ChangeType(str, enum.Enum):
    MANUAL = "MANUAL"
    AI = "AI"


class RecommendationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Route(Base):
    __tablename__ = "routes"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    origin: Mapped[str] = mapped_column(String, nullable=False)
    destination: Mapped[str] = mapped_column(String, nullable=False)
    flights: Mapped[list["Flight"]] = relationship(back_populates="route_obj")


class Flight(Base):
    __tablename__ = "flights"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    route_id: Mapped[str] = mapped_column(ForeignKey("routes.id"), nullable=False)
    flight_number: Mapped[str] = mapped_column(String, nullable=False)
    departure_date: Mapped[date] = mapped_column(Date, nullable=False)
    departure_time: Mapped[str] = mapped_column(String, nullable=False)
    time_slot: Mapped[str] = mapped_column(String, nullable=False)
    load_factor: Mapped[float] = mapped_column(Float, default=0.0)
    pace: Mapped[float] = mapped_column(Float, default=0.0)
    base_cost: Mapped[int] = mapped_column(Integer, default=0)
    route_obj: Mapped["Route"] = relationship(back_populates="flights")
    fare_tiers: Mapped[list["FareTier"]] = relationship(back_populates="flight")
    ai_recommendations: Mapped[list["AiRecommendation"]] = relationship(back_populates="flight")


class FareTier(Base):
    __tablename__ = "fare_tiers"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    flight_id: Mapped[str] = mapped_column(ForeignKey("flights.id"), nullable=False)
    class_code: Mapped[str] = mapped_column(String, nullable=False)
    tier: Mapped[TierCode] = mapped_column(Enum(TierCode), nullable=False)
    current_price: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_recommended_price: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_seats: Mapped[int] = mapped_column(Integer, nullable=False)
    sold_seats: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="open")
    flight: Mapped["Flight"] = relationship(back_populates="fare_tiers")
    price_histories: Mapped[list["PriceHistory"]] = relationship(back_populates="fare_tier")


class PriceHistory(Base):
    __tablename__ = "price_histories"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    fare_tier_id: Mapped[str] = mapped_column(ForeignKey("fare_tiers.id"), nullable=False)
    change_type: Mapped[ChangeType] = mapped_column(Enum(ChangeType), nullable=False)
    price_before: Mapped[int] = mapped_column(Integer, nullable=False)
    price_after: Mapped[int] = mapped_column(Integer, nullable=False)
    changed_by: Mapped[str] = mapped_column(String, nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    fare_tier: Mapped["FareTier"] = relationship(back_populates="price_histories")


class AiRecommendation(Base):
    __tablename__ = "ai_recommendations"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    flight_id: Mapped[str] = mapped_column(ForeignKey("flights.id"), nullable=False)
    class_code: Mapped[str] = mapped_column(String, nullable=False)
    current_price: Mapped[int] = mapped_column(Integer, nullable=False)
    recommended_price: Mapped[int] = mapped_column(Integer, nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    change_percent: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_load_factor: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[RecommendationStatus] = mapped_column(Enum(RecommendationStatus), default=RecommendationStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    flight: Mapped["Flight"] = relationship(back_populates="ai_recommendations")


class CompetitorPrice(Base):
    __tablename__ = "competitor_prices"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    route_id: Mapped[str] = mapped_column(ForeignKey("routes.id"), nullable=False)
    airline: Mapped[str] = mapped_column(String, nullable=False)
    booking_class: Mapped[str] = mapped_column(String, nullable=False)
    fare: Mapped[int] = mapped_column(Integer, nullable=False)
    observed_date: Mapped[date] = mapped_column(Date, nullable=False)


class SimulationResult(Base):
    __tablename__ = "simulation_results"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    route_id: Mapped[str] = mapped_column(String, nullable=False)
    simulation_date: Mapped[date] = mapped_column(Date, nullable=False)
    fuel_change_percent: Mapped[float] = mapped_column(Float, default=0.0)
    new_competitor_entry: Mapped[bool] = mapped_column(Boolean, default=False)
    price_change_percent: Mapped[float] = mapped_column(Float, default=0.0)
    expected_demand_change: Mapped[float] = mapped_column(Float, nullable=False)
    expected_revenue_change: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    route_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    total_revenue: Mapped[int] = mapped_column(Integer, nullable=False)
    total_target: Mapped[int] = mapped_column(Integer, nullable=False)
    achieve_rate: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
